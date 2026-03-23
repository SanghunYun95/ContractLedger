"use client";

import React, { createContext, useContext, useState } from "react";

type Tenant = {
  id: string;
  name: string;
};

const tenants: Tenant[] = [
  { id: "tenant-a", name: "Acme Corp" },
  { id: "tenant-b", name: "Globex" }
];

interface TenantContextType {
  activeTenant: Tenant;
  setActiveTenant: (tenant: Tenant) => void;
  availableTenants: Tenant[];
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [activeTenant, setActiveTenant] = useState<Tenant>(tenants[0]);

  return (
    <TenantContext.Provider value={{ activeTenant, setActiveTenant, availableTenants: tenants }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
