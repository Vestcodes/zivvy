"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  initialBankAccount?: string;
  initialStatus?: string;
  initialFromDate?: string;
  initialToDate?: string;
}

export function TransactionsFilterBar({
  initialBankAccount,
  initialStatus,
  initialFromDate,
  initialToDate,
}: Props) {
  const router = useRouter();
  const [bankAccount, setBankAccount] = useState(initialBankAccount ?? "");
  const [status, setStatus] = useState(initialStatus ?? "");
  const [fromDate, setFromDate] = useState(initialFromDate ?? "");
  const [toDate, setToDate] = useState(initialToDate ?? "");

  const apply = () => {
    const params = new URLSearchParams();
    if (bankAccount) params.set("bank_account", bankAccount);
    if (status) params.set("status", status);
    if (fromDate) params.set("from_date", fromDate);
    if (toDate) params.set("to_date", toDate);
    const qs = params.toString();
    router.push(`/finance/banking/transactions${qs ? `?${qs}` : ""}`);
  };

  const clear = () => {
    setBankAccount("");
    setStatus("");
    setFromDate("");
    setToDate("");
    router.push("/finance/banking/transactions");
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <Label className="text-xs">Bank account</Label>
            <Input
              placeholder="Account name"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Status</Label>
            <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Settled">Settled</SelectItem>
                <SelectItem value="Unreconciled">Unreconciled</SelectItem>
                <SelectItem value="Reconciled">Reconciled</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">From</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">To</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <Button size="sm" onClick={apply} className="flex-1">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Apply
            </Button>
            <Button size="sm" variant="ghost" onClick={clear}>
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
