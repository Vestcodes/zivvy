import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TenantContext } from '../common/interfaces/tenant-context.interface';

interface GetListOptions {
  fields?: string[];
  filters?: any;
  orderBy?: string;
  limit?: number;
  offset?: number;
  tenant: TenantContext;
}

@Injectable()
export class FrappeService {
  private readonly logger = new Logger(FrappeService.name);
  private readonly frappeUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.frappeUrl = this.configService.get<string>(
      'FRAPPE_URL',
      'https://api.zivvy.xyz',
    );
  }

  /**
   * List documents of a given doctype with pagination and filtering.
   */
  async getList(
    doctype: string,
    opts: GetListOptions,
  ): Promise<{ data: any[]; total: number }> {
    const {
      fields = ['*'],
      filters = {},
      orderBy,
      limit = 20,
      offset = 0,
      tenant,
    } = opts;

    const tenantFilters = this.addTenantFilter(filters, tenant);

    const params = new URLSearchParams();
    params.set('doctype', doctype);
    params.set('fields', JSON.stringify(fields));
    params.set('filters', JSON.stringify(tenantFilters));
    params.set('limit_page_length', String(limit));
    params.set('limit_start', String(offset));
    if (orderBy) {
      params.set('order_by', orderBy);
    }

    const [listResponse, countResponse] = await Promise.all([
      this.request(
        'GET',
        `/api/resource/${encodeURIComponent(doctype)}?${params.toString()}`,
        tenant,
      ),
      this.request(
        'GET',
        `/api/method/frappe.client.get_count?doctype=${encodeURIComponent(doctype)}&filters=${encodeURIComponent(JSON.stringify(tenantFilters))}`,
        tenant,
      ),
    ]);

    return {
      data: listResponse.data || [],
      total:
        typeof countResponse.message === 'number'
          ? countResponse.message
          : parseInt(countResponse.message, 10) || 0,
    };
  }

  /**
   * Get a single document by name.
   */
  async getDoc(
    doctype: string,
    name: string,
    tenant: TenantContext,
  ): Promise<any> {
    const response = await this.request(
      'GET',
      `/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`,
      tenant,
    );
    return response.data;
  }

  /**
   * Create a new document.
   */
  async createDoc(
    doctype: string,
    data: Record<string, any>,
    tenant: TenantContext,
  ): Promise<any> {
    const body = { ...data, zivvy_tenant: tenant.name };
    const response = await this.request(
      'POST',
      `/api/resource/${encodeURIComponent(doctype)}`,
      tenant,
      body,
    );
    return response.data;
  }

  /**
   * Update an existing document.
   */
  async updateDoc(
    doctype: string,
    name: string,
    data: Record<string, any>,
    tenant: TenantContext,
  ): Promise<any> {
    const response = await this.request(
      'PUT',
      `/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`,
      tenant,
      data,
    );
    return response.data;
  }

  /**
   * Delete a document.
   */
  async deleteDoc(
    doctype: string,
    name: string,
    tenant: TenantContext,
  ): Promise<void> {
    await this.request(
      'DELETE',
      `/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`,
      tenant,
    );
  }

  /**
   * Call a Frappe whitelisted method.
   */
  async call(
    method: string,
    args: Record<string, any>,
    tenant: TenantContext,
  ): Promise<any> {
    const response = await this.request(
      'POST',
      `/api/method/${method}`,
      tenant,
      args,
    );
    return response.message ?? response;
  }

  /**
   * Submit a document (set docstatus = 1).
   */
  async submitDoc(
    doctype: string,
    name: string,
    tenant: TenantContext,
  ): Promise<any> {
    return this.call('frappe.client.submit', { doc: { doctype, name } }, tenant);
  }

  /**
   * Upload a file to Frappe via the standard /api/method/upload_file endpoint.
   * Optionally attach it to an existing document by passing doctype/docname.
   *
   * Returns the created File doc (contains file_url that callers can persist
   * on their target document).
   */
  async uploadFile(
    file: { buffer: Buffer; originalname: string; mimetype?: string },
    opts: {
      doctype?: string;
      docname?: string;
      isPrivate?: boolean;
      folder?: string;
      tenant: TenantContext;
    },
  ): Promise<any> {
    const { tenant, doctype, docname, isPrivate = true, folder } = opts;
    const url = `${this.frappeUrl}/api/method/upload_file`;

    const form = new FormData();
    const blob = new Blob([file.buffer], {
      type: file.mimetype || 'application/octet-stream',
    });
    form.append('file', blob, file.originalname);
    form.append('file_name', file.originalname);
    form.append('is_private', isPrivate ? '1' : '0');
    if (doctype) form.append('doctype', doctype);
    if (docname) form.append('docname', docname);
    if (folder) form.append('folder', folder);

    // Multipart request — do NOT set Content-Type manually; let fetch set the
    // multipart boundary. Reuse tenant headers minus Content-Type/Accept.
    const headers: Record<string, string> = {
      'X-Frappe-Site-Name': tenant.site,
    };
    if (tenant.sid) {
      headers['Cookie'] = `sid=${tenant.sid}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: form as any,
      });

      if (!response.ok) {
        await this.handleFrappeError(response);
      }

      const json = (await response.json()) as Record<string, any>;
      return json.message ?? json;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        `Frappe file upload failed: ${file.originalname}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException(
        'Failed to upload file to the backend service',
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private addTenantFilter(
    filters: any,
    tenant: TenantContext,
  ): Record<string, any> {
    if (Array.isArray(filters)) {
      return [...filters, ['zivvy_tenant', '=', tenant.name]];
    }
    return { ...filters, zivvy_tenant: tenant.name };
  }

  private buildHeaders(tenant: TenantContext): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Frappe-Site-Name': tenant.site,
    };

    if (tenant.sid) {
      headers['Cookie'] = `sid=${tenant.sid}`;
    }

    return headers;
  }

  private async request(
    method: string,
    path: string,
    tenant: TenantContext,
    body?: Record<string, any>,
  ): Promise<any> {
    const url = `${this.frappeUrl}${path}`;
    const headers = this.buildHeaders(tenant);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        await this.handleFrappeError(response);
      }

      if (response.status === 204) {
        return {};
      }

      return await response.json();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(
        `Frappe request failed: ${method} ${path}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException(
        'Failed to communicate with the backend service',
      );
    }
  }

  private async handleFrappeError(response: Response): Promise<never> {
    let message = `Frappe API error (${response.status})`;

    try {
      const errorBody = (await response.json()) as Record<string, any>;
      if (errorBody?.exc_type) {
        message = errorBody.exc_type;
      }
      if (errorBody?._server_messages) {
        const serverMessages = JSON.parse(errorBody._server_messages);
        if (Array.isArray(serverMessages) && serverMessages.length > 0) {
          const parsed = JSON.parse(serverMessages[0]);
          message = parsed.message || message;
        }
      }
      if (errorBody?.message) {
        message = errorBody.message;
      }
    } catch {
      // Could not parse error body; use default message
    }

    switch (response.status) {
      case 404:
        throw new NotFoundException(message);
      case 403:
        throw new ForbiddenException(message);
      case 400:
        throw new BadRequestException(message);
      case 409:
        throw new HttpException(message, HttpStatus.CONFLICT);
      case 422:
        throw new HttpException(message, HttpStatus.UNPROCESSABLE_ENTITY);
      case 429:
        throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
      case 502:
      case 503:
        throw new HttpException(message, HttpStatus.BAD_GATEWAY);
      default:
        throw new InternalServerErrorException(message);
    }
  }
}
