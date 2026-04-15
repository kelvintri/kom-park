"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Log {
  id: string;
  nama: string;
  nimNip: string;
  gate: string;
  status: string;
  waktu: string;
  sumber: string;
}

interface LogTableProps {
  logs: Log[];
}

export function LogTable({ logs }: LogTableProps) {
  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Waktu</TableHead>
            <TableHead>Nama / Identitas</TableHead>
            <TableHead>Gate / Lokasi</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sumber</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length > 0 ? (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {format(new Date(log.waktu), "HH:mm:ss", { locale: id })}
                  <span className="text-xs text-slate-400 block">
                    {format(new Date(log.waktu), "dd MMM yyyy", { locale: id })}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{log.nama}</div>
                  <div className="text-xs text-slate-500 uppercase">{log.nimNip}</div>
                </TableCell>
                <TableCell>{log.gate}</TableCell>
                <TableCell>
                  <Badge 
                    variant={log.status === "MASUK" ? "default" : "secondary"}
                    className={log.status === "MASUK" ? "bg-blue-600" : "bg-amber-500 text-white"}
                  >
                    {log.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {log.sumber}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-slate-400">
                Belum ada aktivitas parkir tercatat hari ini.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
