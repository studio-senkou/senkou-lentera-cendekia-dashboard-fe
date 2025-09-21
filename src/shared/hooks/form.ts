import { createFormHook } from '@tanstack/react-form'

import { ComboboxField, MultiComboboxField } from '../ui/combobox-field'
import { fieldContext, formContext } from './form-context'
import { TextField } from '@/shared/ui/text-field'
import { NumberField } from '@/shared/ui/number-field'
import { Select } from '@/shared/ui/select-field'
import { TextArea } from '@/shared/ui/text-area'
import { TimePicker } from '@/shared/ui/time-picker'
import { DatePicker } from '@/shared/ui/date-picker'
import { FileInput } from '@/shared/ui/file-input'
import { DateTimePicker } from '@/shared/ui/date-time-picker'
import { SubscribeButton } from '@/shared/ui/subscribe-button'

export const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    NumberField,
    Select,
    ComboboxField,
    MultiComboboxField,
    TextArea,
    TimePicker,
    DatePicker,
    FileInput,
    DateTimePicker,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
})
