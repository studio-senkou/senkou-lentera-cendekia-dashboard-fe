import { createFormHook } from '@tanstack/react-form'

import {
  DatePicker,
  FileInput,
  NumberField,
  Select,
  SubscribeButton,
  TextArea,
  TextField,
  TimePicker,
  DateTimePicker,
} from '../components/form'
import { fieldContext, formContext } from './form-context'

export const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    NumberField,
    Select,
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
