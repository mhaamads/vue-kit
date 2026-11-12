# Examples

Reference shapes written to every rule in `SKILL.md`. Copy the shape, not the domain. They use `@mhaamads/vue-kit`; in a project without it, the project's own components take the same places.

The domain: customers, each with a list of contacts.

## Types

```ts
// src/types/models/contact.model.ts
export type Contact = {
  id: number
  name: string
  email: string
  phone: string
  role: ContactRole
}
```

```ts
// src/types/api/contacts/update-contact-role.request.ts
export type UpdateContactRoleRequest = {
  contactId: number
  role: ContactRole
}
```

```ts
// src/types/pages/customers/contacts/contact-form.types.ts
export type ContactFormData = {
  name: string
  email: string
  phone: string
  role: ContactRole | null
}
```

## Constants

```ts
// src/constants/contact.constants.ts
export const CONTACT_ROLE = {
  OWNER: 'owner',
  BILLING: 'billing',
  SUPPORT: 'support',
} as const
export type ContactRole = (typeof CONTACT_ROLE)[keyof typeof CONTACT_ROLE]

export const CONTACT_ROLE_OPTIONS = [
  { label: 'Owner', value: CONTACT_ROLE.OWNER },
  { label: 'Billing', value: CONTACT_ROLE.BILLING },
  { label: 'Support', value: CONTACT_ROLE.SUPPORT },
]

export const MAX_CONTACTS = 20
```

## API

```ts
// src/api/http.ts (kit projects)
import { createHttpClient } from '@mhaamads/vue-kit/http'

export const http = createHttpClient({
  baseUrls: { main: import.meta.env.VITE_API_URL },
  getHeaders: () => ({ Authorization: `Bearer ${useAuthStore().token}` }),
})
```

```ts
// src/api/contacts.api.ts
import { http } from '@/api/http'
import type { Contact } from '@/types/models/contact.model'
import type { ContactFormData } from '@/types/pages/customers/contacts/contact-form.types'
import type { UpdateContactRoleRequest } from '@/types/api/contacts/update-contact-role.request'

export const contactsApi = {
  list: (customerId: string) => http<Contact[]>(`customers/${customerId}/contacts`),

  create: (customerId: string, body: ContactFormData) =>
    http<Contact>(`customers/${customerId}/contacts`, {
      method: 'POST',
      body,
      showSuccessToast: true,
    }),

  updateRole: (customerId: string, { contactId, role }: UpdateContactRoleRequest) =>
    http<void>(`customers/${customerId}/contacts/${contactId}/role`, {
      method: 'PATCH',
      body: { role },
      showSuccessToast: true,
    }),

  remove: (customerId: string, contactId: number) =>
    http<void>(`customers/${customerId}/contacts/${contactId}`, {
      method: 'DELETE',
      showSuccessToast: true,
    }),
}
```

## Composable

```ts
// src/composables/pages/customers/useContacts.ts
import { contactsApi } from '@/api/contacts.api'
import type { Contact } from '@/types/models/contact.model'

/** Loads a customer's contacts and keeps the list in sync after deletes. */
export const useContacts = (customerId: MaybeRefOrGetter<string>) => {
  const contacts = ref<Contact[]>([])
  const isLoading = ref(false)

  const hasContacts = computed(() => contacts.value.length > 0)

  const fetchContacts = async () => {
    isLoading.value = true
    try {
      contacts.value = await contactsApi.list(toValue(customerId))
    } finally {
      isLoading.value = false
    }
  }

  const removeFromList = (contactId: number) => {
    contacts.value = contacts.value.filter((contact) => contact.id !== contactId)
  }

  watch(() => toValue(customerId), fetchContacts, { immediate: true })

  return { contacts, isLoading, hasContacts, fetchContacts, removeFromList }
}
```

## Component

```vue
<!-- src/components/cards/ContactCard.vue -->
<template>
  <div class="card-default border border-neutral-default">
    <div class="grid grid-cols-3 gap-form p-4">
      <InfoItem icon="User" label="Name" :value="contact.name" />
      <InfoItem icon="Sms" label="Email" :value="contact.email" />
      <InfoItem icon="Briefcase" label="Role" :value="contact.role" />
    </div>
    <div class="flex items-center justify-end gap-2 p-4">
      <AppButton variant="secondary" :to="editRoute">Edit</AppButton>
      <AppButton variant="danger" :loading="isDeleting" @click="handleDeleteClick">Delete</AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AppButton, useConfirm } from '@mhaamads/vue-kit/ui'
import InfoItem from '@/components/ui/InfoItem.vue'
import { contactsApi } from '@/api/contacts.api'
import { ROUTE } from '@/router/routes'
import type { Contact } from '@/types/models/contact.model'

const { customerId, contact } = defineProps<{
  customerId: string
  contact: Contact
}>()

const emit = defineEmits<{ deleted: [contactId: number] }>()

const isDeleting = ref(false)

const editRoute = computed(() => ({
  name: ROUTE.CONTACT_EDIT.NAME,
  params: { customerId, contactId: contact.id },
}))

const deleteContact = async () => {
  isDeleting.value = true
  try {
    await contactsApi.remove(customerId, contact.id)
    emit('deleted', contact.id)
  } finally {
    isDeleting.value = false
  }
}

const handleDeleteClick = async () => {
  const isConfirmed = await useConfirm({
    type: 'error',
    title: 'Delete contact',
    message: 'This action cannot be undone.',
    confirmLabel: 'Delete',
  })
  if (isConfirmed) await deleteContact()
}
</script>
```

## Dialog

```vue
<!-- src/components/pages/customers/ArchiveCustomerDialog.vue -->
<template>
  <AppDialog v-model="isOpen" title="Archive customer">
    <AppInput id="reason" v-model="reason" label="Reason" :rules="{ required: true }" />
    <template #footer>
      <AppButton variant="secondary" @click="handleCancelClick">Cancel</AppButton>
      <AppButton variant="danger" :disabled="!reason" @click="handleArchiveClick">Archive</AppButton>
    </template>
  </AppDialog>
</template>

<script setup lang="ts">
import { AppButton, AppDialog, AppInput } from '@mhaamads/vue-kit/ui'

const emit = defineEmits<{ archive: [reason: string] }>()
const isOpen = defineModel<boolean>({ default: false })

const reason = ref('')

const handleCancelClick = () => {
  isOpen.value = false
}

const handleArchiveClick = () => {
  emit('archive', reason.value)
  isOpen.value = false
}
</script>
```

## Schema

```ts
// src/schemas/customer/contact.schema.ts
import { defineSchema } from '@mhaamads/vue-kit/utils'
import type { ContactFormData } from '@/types/pages/customers/contacts/contact-form.types'

export const createContactSchema = ({ isPhoneRequired = false } = {}) =>
  defineSchema<ContactFormData>({
    name: { required: true, label: 'Name' },
    email: { required: true, isEmail: true, label: 'Email' },
    phone: { required: isPhoneRequired, label: 'Phone' },
    role: { required: true, label: 'Role' },
  })
```

## Form page

```vue
<!-- src/pages/customers/contacts/create.vue -->
<template>
  <div class="page-spacing">
    <AppForm :schema="contactSchema" :form-data="formData" warn-unsaved @submit="handleSubmit">
      <template #default="{ errors }">
        <div class="flex items-center justify-between">
          <Breadcrumb :items="breadcrumbItems" />
          <div class="flex items-center gap-2">
            <AppButton :to="backRoute" variant="secondary">Cancel</AppButton>
            <AppButton type="submit" :loading="isSubmitting" variant="primary">Save</AppButton>
          </div>
        </div>
        <DetailsBlock title="Contact details" subtitle="Who we talk to at this customer.">
          <div class="form-fields-grid">
            <AppInput id="name" v-model="formData.name" label="Name" :errors="errors.name" required />
            <AppInput id="email" v-model="formData.email" label="Email" type="email" :errors="errors.email" required />
            <AppInput id="phone" v-model="formData.phone" label="Phone" type="tel" :errors="errors.phone" />
            <AppSelect id="role" v-model="formData.role" label="Role" :options="CONTACT_ROLE_OPTIONS" :errors="errors.role" required />
          </div>
        </DetailsBlock>
      </template>
    </AppForm>
  </div>
</template>

<script setup lang="ts">
import { AppButton, AppForm, AppInput, AppSelect } from '@mhaamads/vue-kit/ui'
import Breadcrumb from '@/components/ui/Breadcrumb.vue'
import DetailsBlock from '@/components/blocks/DetailsBlock.vue'
import { contactsApi } from '@/api/contacts.api'
import { CONTACT_ROLE_OPTIONS } from '@/constants/contact.constants'
import { createContactSchema } from '@/schemas/customer/contact.schema'
import { ROUTE } from '@/router/routes'
import type { ContactFormData } from '@/types/pages/customers/contacts/contact-form.types'

const { customerId } = defineProps<{ customerId: string }>()

const router = useRouter()

const contactSchema = createContactSchema()
const isSubmitting = ref(false)
const formData = ref<ContactFormData>({
  name: '',
  email: '',
  phone: '',
  role: null,
})

const backRoute = computed(() => ({
  name: ROUTE.CUSTOMER_VIEW.NAME,
  params: { customerId, tab: 'contacts' },
}))

const breadcrumbItems = computed(() => [
  { name: 'Customers', to: { name: ROUTE.CUSTOMERS.NAME } },
  { name: 'Add contact' },
])

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    await contactsApi.create(customerId, formData.value)
    router.push(backRoute.value)
  } finally {
    isSubmitting.value = false
  }
}
</script>
```

## Store

```ts
// src/stores/ui.store.ts
export const useUiStore = defineStore('ui', () => {
  const theme = ref<'light' | 'dark'>('light')
  const isSidebarOpen = ref(true)

  const isDark = computed(() => theme.value === 'dark')

  const toggleTheme = () => {
    theme.value = isDark.value ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme.value
  }

  return { theme, isSidebarOpen, isDark, toggleTheme }
})
```

## Route entry

```ts
// src/router/routes.ts (excerpt)
export const ROUTE = {
  CUSTOMERS: { NAME: 'customers', PATH: '/customers', PERMISSIONS: SALES_PERMISSIONS },
  CUSTOMER_VIEW: { NAME: 'customer-view', PATH: '/customers/:customerId/:tab' },
  CONTACT_CREATE: { NAME: 'contact-create', PATH: '/customers/:customerId/contacts/create' },
  CONTACT_EDIT: { NAME: 'contact-edit', PATH: '/customers/:customerId/contacts/:contactId' },
} as const

export const routes: RouteRecordRaw[] = [
  {
    path: ROUTE.CONTACT_CREATE.PATH,
    name: ROUTE.CONTACT_CREATE.NAME,
    component: () => import('@/pages/customers/contacts/create.vue'),
    props: true,
  },
]
```
