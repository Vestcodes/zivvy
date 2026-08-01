import frappe
from frappe.model.document import Document


class ZivvyWebhook(Document):
	def before_insert(self):
		self.created_by = frappe.session.user

	def validate(self):
		if self.url and not self.url.startswith("https://"):
			if not (self.url.startswith("http://localhost") or self.url.startswith("http://127.0.0.1")):
				frappe.throw("Webhook URL must use HTTPS")
