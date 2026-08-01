import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactResponseDto } from './dto/contact-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ErrorResponse } from '../../common/dto/api-response.dto';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';

@ApiTags('Contacts')
@ApiSecurity('api-key')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @ApiOperation({ summary: 'List contacts', description: 'Retrieve a paginated list of contacts.' })
  @ApiResponse({ status: 200, description: 'Paginated list of contacts' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  async findAll(
    @Query() pagination: PaginationDto,
    @Tenant() tenant?: TenantContext,
  ) {
    const { data, total } = await this.contactsService.findAll(pagination, tenant!);
    return {
      data,
      meta: { total, limit: pagination.limit!, offset: pagination.offset! },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contact', description: 'Retrieve a single contact by ID.' })
  @ApiParam({ name: 'id', description: 'Contact ID or name' })
  @ApiResponse({ status: 200, description: 'Contact details', type: ContactResponseDto })
  @ApiResponse({ status: 404, description: 'Contact not found', type: ErrorResponse })
  async findOne(
    @Param('id') id: string,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.contactsService.findOne(id, tenant!);
  }

  @Post()
  @ApiOperation({ summary: 'Create a contact', description: 'Create a new contact record.' })
  @ApiResponse({ status: 201, description: 'Contact created', type: ContactResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  async create(
    @Body() dto: CreateContactDto,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.contactsService.create(dto, tenant!);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contact', description: 'Partially update an existing contact.' })
  @ApiParam({ name: 'id', description: 'Contact ID or name' })
  @ApiResponse({ status: 200, description: 'Contact updated', type: ContactResponseDto })
  @ApiResponse({ status: 404, description: 'Contact not found', type: ErrorResponse })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.contactsService.update(id, dto, tenant!);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contact', description: 'Permanently delete a contact.' })
  @ApiParam({ name: 'id', description: 'Contact ID or name' })
  @ApiResponse({ status: 200, description: 'Contact deleted' })
  @ApiResponse({ status: 404, description: 'Contact not found', type: ErrorResponse })
  async remove(
    @Param('id') id: string,
    @Tenant() tenant?: TenantContext,
  ) {
    await this.contactsService.remove(id, tenant!);
    return { message: 'Contact deleted successfully' };
  }
}
