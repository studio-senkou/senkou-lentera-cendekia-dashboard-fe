import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { Calendar, Download, UserX } from 'lucide-react'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { format } from 'date-fns'
import { id } from 'date-fns/locale' // Indonesian locale for date-fns

import { getPublicMeetingSessionByUser } from '@/entities/meeting-sessions'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

export const Route = createFileRoute('/report/$user')({
  component: PublicReportPage,
})

function PublicReportPage() {
  const { user } = useParams({
    from: '/report/$user',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['public-report', user],
    queryFn: () => getPublicMeetingSessionByUser(user),
  })

  const getInitials = (name: string) => {
    return name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : ''
  }

  const handleExportExcel = async () => {
    if (!data?.sessions || !data.student) return

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Laporan Sesi')

    worksheet.mergeCells('A1:G1')
    const titleRow = worksheet.getCell('A1')
    titleRow.value = `Laporan Sesi Pembelajaran - ${data.student.name}`
    titleRow.font = { size: 16, bold: true }
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.addRow([])

    const headerRow = worksheet.addRow([
      'No',
      'Tanggal',
      'Waktu',
      'Durasi',
      'Mentor',
      'Topik / Deskripsi',
      'Catatan',
    ])
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF125E8A' },
      }
      cell.alignment = { vertical: 'middle', horizontal: 'center' }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    })

    data.sessions.forEach((session: any, index: number) => {
      const minutes = Number(session.duration) || 0
      let durationStr = `${minutes}m`
      if (minutes >= 60) {
        const h = Math.floor(minutes / 60)
        const m = minutes % 60
        durationStr = m > 0 ? `${h}h ${m}m` : `${h}h`
      }

      const row = worksheet.addRow([
        index + 1,
        session.session_date
          ? format(new Date(session.session_date), 'dd MMMM yyyy', {
              locale: id,
            })
          : '-',
        session.session_time ? session.session_time.slice(0, 5) : '-',
        durationStr,
        session.mentor?.name || '-',
        session.description || '-',
        session.note || '-',
      ])

      row.eachCell((cell) => {
        cell.alignment = { vertical: 'top', wrapText: true }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
      })
    })

    worksheet.getColumn(1).width = 5
    worksheet.getColumn(2).width = 20
    worksheet.getColumn(3).width = 10
    worksheet.getColumn(4).width = 10
    worksheet.getColumn(5).width = 20
    worksheet.getColumn(6).width = 40
    worksheet.getColumn(7).width = 40

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, `Laporan_Sesi_${data.student.name.replace(/\s+/g, '_')}.xlsx`)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50">
        <p className="text-muted-foreground animate-pulse">Memuat laporan...</p>
      </div>
    )
  }

  if (!data?.student) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <div className="rounded-full bg-red-100 p-4 mb-4">
          <UserX className="h-10 w-10 text-red-600" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Murid Tidak Ditemukan</h2>
        <p className="max-w-md text-muted-foreground">
          Maaf, tautan laporan sesi yang Anda akses tidak valid atau data murid tersebut telah dihapus dari sistem.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full rounded-lg border bg-card p-6 shadow-sm">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {getInitials(data.student.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {data.student.name}
              </h1>
              <p className="text-muted-foreground">{data.student.email}</p>
            </div>
            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-2 text-muted-foreground justify-end">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Total Sesi</span>
              </div>
              <p className="text-3xl font-bold text-primary">
                {data.total_sessions || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Daftar Sesi</h2>
          <Button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700"
            disabled={!data?.sessions?.length}
          >
            <Download className="mr-2 h-4 w-4" />
            Unduh Excel
          </Button>
        </div>

        <div className="rounded-lg border bg-card shadow-sm overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Durasi</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Materi / Deskripsi</TableHead>
                <TableHead>Catatan Mentor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.sessions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                    Belum ada sesi pembelajaran.
                  </TableCell>
                </TableRow>
              ) : (
                data.sessions?.map((session: any) => {
                  const minutes = Number(session.duration) || 0
                  let durationStr = `${minutes}m`
                  if (minutes >= 60) {
                    const h = Math.floor(minutes / 60)
                    const m = minutes % 60
                    durationStr = m > 0 ? `${h}h ${m}m` : `${h}h`
                  }

                  return (
                    <TableRow key={session.id}>
                      <TableCell className="whitespace-nowrap">
                        {session.session_date
                          ? format(new Date(session.session_date), 'dd MMM yyyy', { locale: id })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {session.session_time ? session.session_time.slice(0, 5) : '-'}
                      </TableCell>
                      <TableCell>{durationStr}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        {session.mentor?.name || '-'}
                      </TableCell>
                      <TableCell className="max-w-xs whitespace-pre-wrap">
                        {session.description || '-'}
                      </TableCell>
                      <TableCell className="max-w-xs whitespace-pre-wrap">
                        {session.note || '-'}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
