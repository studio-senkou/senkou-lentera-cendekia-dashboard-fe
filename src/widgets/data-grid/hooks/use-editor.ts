import { useCallback, useMemo } from 'react'

import textEditor from '../components/text-editor.data-grid'
import numberEditor from '../components/number-editor.data-grid'
import selectEditor from '../components/select.data-grid'
import dateEditor from '../components/date-editor.data-grid'
import timeEditor from '../components/time-editor.data-grid'

import type { RenderEditCellProps } from 'react-data-grid'
import type { SelectOption } from '../types'

export const useEditor = <TData>() => {
  const renderTextEditor = useCallback(
    (props: RenderEditCellProps<NoInfer<TData>>) => textEditor(props),
    [],
  )

  const renderNumberEditor = useCallback(
    (props: RenderEditCellProps<NoInfer<TData>>) => numberEditor(props),
    [],
  )

  const renderSelectEditor = useCallback(
    (
      props: RenderEditCellProps<NoInfer<TData>>,
      config: Readonly<{ options: Array<SelectOption> }>,
    ) =>
      selectEditor({
        ...props,
        options: config.options,
      }),
    [],
  )

  const renderDateEditor = useCallback(
    (props: RenderEditCellProps<NoInfer<TData>>) => dateEditor(props),
    [],
  )

  const renderTimeEditor = useCallback(
    (props: RenderEditCellProps<NoInfer<TData>>) => timeEditor(props),
    [],
  )

  const editor = useMemo(() => {
    return {
      renderTextEditor,
      renderNumberEditor,
      renderSelectEditor,
      renderDateEditor,
      renderTimeEditor,
    }
  }, [])

  return {
    editor,
  }
}
