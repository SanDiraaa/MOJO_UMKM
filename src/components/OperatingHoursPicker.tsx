"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface OperatingHoursPickerProps {
  value: string;
  onChange: (value: string) => void;
}

// Pilihan jam setiap 30 menit, format 24 jam
const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

const DAY_PRESETS = [
  { value: "Setiap Hari", label: "Setiap Hari (Senin - Minggu)" },
  { value: "Senin - Sabtu", label: "Senin - Sabtu" },
  { value: "Senin - Jumat", label: "Senin - Jumat" },
  { value: "Sabtu - Minggu", label: "Sabtu - Minggu (akhir pekan saja)" },
];

export default function OperatingHoursPicker({ value, onChange }: OperatingHoursPickerProps) {
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("17:00");
  const [days, setDays] = useState("Setiap Hari");
  const [is24Hours, setIs24Hours] = useState(false);

  // Susun ulang jadi satu string setiap ada perubahan, lalu kirim ke form
  useEffect(() => {
    const jamBagian = is24Hours ? "24 Jam" : `${openTime} - ${closeTime}`;
    onChange(`${jamBagian} (${days})`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openTime, closeTime, days, is24Hours]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Checkbox
          id="buka-24-jam"
          checked={is24Hours}
          onCheckedChange={(checked) => setIs24Hours(checked === true)}
        />
        <Label htmlFor="buka-24-jam" className="font-normal cursor-pointer">
          Buka 24 Jam
        </Label>
      </div>

      {!is24Hours && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm text-muted-foreground mb-1.5 block">Jam Buka</Label>
            <Select value={openTime} onValueChange={setOpenTime}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {TIME_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground mb-1.5 block">Jam Tutup</Label>
            <Select value={closeTime} onValueChange={setCloseTime}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {TIME_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div>
        <Label className="text-sm text-muted-foreground mb-1.5 block">Hari Operasional</Label>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DAY_PRESETS.map((d) => (
              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        Pratinjau: <span className="font-medium text-foreground">{value || "-"}</span>
      </p>
    </div>
  );
}
