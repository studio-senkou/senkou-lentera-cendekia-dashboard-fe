import { useState } from 'react'
import { Edit3 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { FormSheet } from '@/shared/ui/form-sheet'
import { updateClass } from '@/entities/classes'

interface EditClassSheetProps {
  id: number
  classname: string
  disabled?: boolean
  onSuccess?: () => void
}

export function EditClassSheet({
  id,
  classname,
  disabled,
  onSuccess,
}: EditClassSheetProps) {
  const [name, setName] = useState(classname)

  const handleSubmit = async () => {
    if (!name || name.trim().length < 3) {
      throw new Error('Nama kelas minimal 3 karakter')
    }

    await updateClass(id, name.trim())
    onSuccess?.()
  }

  return (
    <FormSheet
      trigger={
        <Button size="icon" variant="warning" aria-label="Edit Kelas">
          <Edit3 className="h-4 w-4" />
        </Button>
      }
      title="Edit Nama Kelas"
      description="Ubah nama kelas. Hanya diperlukan satu input berupa nama baru kelas."
      onSubmitForm={handleSubmit}
      disabled={disabled}
    >
      <div className="px-4 pt-2">
        <Label htmlFor="edit-classname">Nama Kelas</Label>
        <Input
          id="edit-classname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan nama kelas"
          className="mt-2"
        />
      </div>
    </FormSheet>
  )
}

export default EditClassSheet
