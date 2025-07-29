import { createFormHook } from '@tanstack/react-form'

import {
  DatePicker,
  FileInput,
  Select,
  SubscribeButton,
  TextArea,
  TextField,
  TimePicker,
} from '../components/form'
import { fieldContext, formContext } from './form-context'

export const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    Select,
    TextArea,
    TimePicker,
    DatePicker,
    FileInput,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
})
