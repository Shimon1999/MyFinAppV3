import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Wallet } from "lucide-react";

export default function AccountFilterDropdown({ accounts, selectedAccountId, onAccountChange, isLoading }) {
  return (
    <div className="flex items-center gap-2 w-full sm:w-auto max-w-[90%]">
      <Label htmlFor="account-filter" className="text-sm font-medium text-[var(--text-secondary)] whitespace-nowrap hidden xs:inline">
        Account:
      </Label>
      <Select
        id="account-filter"
        value={selectedAccountId}
        onValueChange={onAccountChange}
        disabled={isLoading || accounts.length === 0}
      >
        <SelectTrigger className="h-10 rounded-lg glass-card !py-2 !px-3 text-[var(--text-primary)] hover:!shadow-md focus:ring-2 focus:ring-[var(--primary-end)] w-full">
          <div className="flex items-center truncate">
            <Wallet className="w-4 h-4 mr-2 text-[var(--primary-end)] flex-shrink-0" />
            <SelectValue placeholder="Filter by account" className="truncate" />
          </div>
        </SelectTrigger>
        <SelectContent className="glass-card border-none shadow-2xl max-w-[calc(100vw-2rem)]">
          <SelectItem value="all" className="hover:!bg-[var(--primary-start)]/30 focus:!bg-[var(--primary-start)]/40">
            All Accounts
          </SelectItem>
          {accounts.map(account => (
            <SelectItem key={account.id} value={account.id} className="hover:!bg-[var(--primary-start)]/30 focus:!bg-[var(--primary-start)]/40 truncate">
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}