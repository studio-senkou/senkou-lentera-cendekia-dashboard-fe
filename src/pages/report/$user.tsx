import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { Calendar, Download, UserX, Clock } from 'lucide-react'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

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

    worksheet.mergeCells('A1:H1')
    const titleRow = worksheet.getCell('A1')
    titleRow.value = `Laporan Sesi Pembelajaran — ${data.student.name}`
    titleRow.font = { size: 16, bold: true, color: { argb: 'FF101828' } }
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' }
    worksheet.addRow([])

    const headerRow = worksheet.addRow([
      'No',
      'Tanggal',
      'Waktu',
      'Durasi',
      'Mentor',
      'Mata Pelajaran',
      'Materi / Deskripsi',
      'Catatan Mentor',
    ])
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF101828' },
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
          ? format(new Date(session.session_date), 'dd MMMM yyyy', { locale: id })
          : '-',
        session.session_time ? session.session_time.slice(0, 5) : '-',
        durationStr,
        session.mentor?.name || '-',
        session.subject || '-',
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
    worksheet.getColumn(5).width = 22
    worksheet.getColumn(6).width = 20
    worksheet.getColumn(7).width = 40
    worksheet.getColumn(8).width = 40

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, `Laporan_Sesi_${data.student.name.replace(/\s+/g, '_')}.xlsx`)
  }

  // ── Loading State ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#FFF8EE' }}>
        <div className="text-center space-y-3">
          <div
            className="mx-auto h-10 w-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: '#FF5C06', borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: '#667085', fontFamily: 'Inter, sans-serif' }}>
            Memuat laporan...
          </p>
        </div>
      </div>
    )
  }

  // ── Not Found State ────────────────────────────────────────────────────────
  if (!data?.student) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center p-6 text-center"
        style={{ background: '#FFF8EE' }}
      >
        <div
          className="rounded-full p-5 mb-6"
          style={{ background: 'rgba(220,38,38,0.08)' }}
        >
          <UserX className="h-10 w-10" style={{ color: '#DC2626' }} />
        </div>
        <h2
          className="mb-3 text-3xl"
          style={{
            fontFamily: '"EB Garamond", Georgia, serif',
            color: '#101828',
            fontWeight: 400,
          }}
        >
          Murid Tidak Ditemukan
        </h2>
        <p
          className="max-w-md text-base leading-relaxed"
          style={{ color: '#667085', fontFamily: 'Inter, sans-serif' }}
        >
          Maaf, tautan laporan sesi yang Anda akses tidak valid atau data murid tersebut telah dihapus dari sistem.
        </p>
      </div>
    )
  }

  // ── Main Page ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: '#FFF8EE', fontFamily: 'Inter, sans-serif' }}>
      {/* ── Navbar (matches dashboard header) ── */}
      <header
        className="sticky top-0 z-10 flex h-[64px] w-full items-center border-b px-6 sm:px-12 lg:px-16"
        style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(16,24,40,0.08)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md"
            style={{ background: '#FF5C06' }}
          >
            <span className="text-sm font-bold text-white">LC</span>
          </div>
          <span
            className="text-base font-semibold hidden sm:block"
            style={{ color: '#101828', fontFamily: 'Inter, sans-serif' }}
          >
            Lentera Cendekia
          </span>
        </div>
        <div className="ml-auto">
          <span className="text-xs" style={{ color: '#98A2B3', fontFamily: 'Inter, sans-serif' }}>
            Laporan Publik Murid
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12 space-y-8">

        {/* ── Student Profile Card ── */}
        <div
          className="rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5"
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(16,24,40,0.08)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarFallback
              className="text-xl font-semibold"
              style={{ background: '#101828', color: '#FFFFFF' }}
            >
              {getInitials(data.student.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h1
              className="text-3xl md:text-4xl leading-tight truncate"
              style={{
                fontFamily: '"EB Garamond", Georgia, serif',
                fontWeight: 400,
                color: '#101828',
              }}
            >
              {data.student.name}
            </h1>
            <p className="mt-1 text-sm truncate" style={{ color: '#667085' }}>
              {data.student.email}
            </p>
          </div>

          <div className="flex gap-6 sm:text-right">
            <div>
              <div
                className="flex items-center gap-1.5 mb-1"
                style={{ color: '#98A2B3' }}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Total Sesi
                </span>
              </div>
              <p
                className="text-4xl font-bold tabular-nums"
                style={{ color: '#FF5C06', lineHeight: 1 }}
              >
                {data.total_sessions || 0}
              </p>
            </div>
          </div>
        </div>

        {/* ── Session Table Section ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-2xl"
              style={{
                fontFamily: '"EB Garamond", Georgia, serif',
                fontWeight: 400,
                color: '#101828',
              }}
            >
              Riwayat Sesi Pembelajaran
            </h2>
            <Button
              onClick={handleExportExcel}
              disabled={!data?.sessions?.length}
              className="h-11 px-5 text-sm font-medium rounded-md"
              style={{
                background: '#101828',
                color: '#FFFFFF',
                border: 'none',
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Unduh Excel
            </Button>
          </div>

          <div
            className="rounded-lg overflow-hidden"
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(16,24,40,0.08)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <Table>
              <TableHeader>
                <TableRow style={{ background: '#F9FAFB', borderBottom: '1px solid rgba(16,24,40,0.08)' }}>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider py-3" style={{ color: '#667085' }}>Tanggal</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider py-3" style={{ color: '#667085' }}>Waktu</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider py-3" style={{ color: '#667085' }}>Durasi</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider py-3" style={{ color: '#667085' }}>Mentor</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider py-3" style={{ color: '#667085' }}>Mata Pelajaran</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider py-3" style={{ color: '#667085' }}>Materi / Deskripsi</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider py-3" style={{ color: '#667085' }}>Catatan Mentor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!data.sessions?.length ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-32 text-center"
                      style={{ color: '#98A2B3' }}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Clock className="h-8 w-8 opacity-30" />
                        <span>Belum ada sesi pembelajaran yang tercatat.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.sessions.map((session: any, idx: number) => {
                    const minutes = Number(session.duration) || 0
                    let durationStr = `${minutes}m`
                    if (minutes >= 60) {
                      const h = Math.floor(minutes / 60)
                      const m = minutes % 60
                      durationStr = m > 0 ? `${h}h ${m}m` : `${h}h`
                    }

                    return (
                      <TableRow
                        key={session.id}
                        style={{
                          background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                          borderBottom: '1px solid rgba(16,24,40,0.06)',
                        }}
                      >
                        <TableCell
                          className="py-3 text-sm whitespace-nowrap font-medium"
                          style={{ color: '#101828' }}
                        >
                          {session.session_date
                            ? format(new Date(session.session_date), 'dd MMM yyyy', { locale: id })
                            : '-'}
                        </TableCell>
                        <TableCell className="py-3 text-sm whitespace-nowrap" style={{ color: '#667085' }}>
                          {session.session_time ? session.session_time.slice(0, 5) : '-'}
                        </TableCell>
                        <TableCell className="py-3 text-sm whitespace-nowrap" style={{ color: '#667085' }}>
                          {durationStr}
                        </TableCell>
                        <TableCell className="py-3 text-sm whitespace-nowrap font-medium" style={{ color: '#101828' }}>
                          {session.mentor?.name || '-'}
                        </TableCell>
                        <TableCell className="py-3 text-sm whitespace-nowrap" style={{ color: '#667085' }}>
                          {session.subject ? (
                            <span
                              className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                              style={{
                                background: 'rgba(21,93,238,0.08)',
                                color: '#155DEE',
                              }}
                            >
                              {session.subject}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell
                          className="py-3 text-sm max-w-xs"
                          style={{ color: '#667085', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                        >
                          {session.description || '-'}
                        </TableCell>
                        <TableCell
                          className="py-3 text-sm max-w-xs"
                          style={{ color: '#667085', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                        >
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

        {/* ── Footer ── */}
        <div className="text-center pt-4 pb-8">
          <p className="text-xs" style={{ color: '#98A2B3' }}>
            Dokumen ini diterbitkan oleh{' '}
            <span className="font-semibold" style={{ color: '#667085' }}>
              Lentera Cendekia
            </span>
            {' '}· Bersifat rahasia dan hanya untuk keperluan internal.
          </p>
        </div>
      </div>
    </div>
  )
}
