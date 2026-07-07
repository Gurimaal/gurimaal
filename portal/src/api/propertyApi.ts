import { apiClient } from "./client";

export type PropertyResponse = {
  unit?: {
    name?: string;
    unit_no?: string;
    floor?: string;
    unit_type?: string;
    area_sqft?: number;
    bedrooms?: number;
    monthly_rent?: number;
    status?: string;
  };
  floor?: {
    name?: string;
    building?: string;
    floor_name?: string;
    floor_number?: number;
  };
  building?: {
    name?: string;
    project?: string;
    building_name?: string;
    total_floors?: number;
    status?: string;
  };
  project?: {
    name?: string;
    project_name?: string;
    company?: string;
    address?: string;
    city?: string;
    status?: string;
    description?: string;
  };
};

export const propertyApi = {
  getMyProperty: () =>
    apiClient.method<PropertyResponse | null>("gurimaal.api.property.property_detail"),
  listMyUnits: (limit = 20) =>
    apiClient.method<PropertyResponse["unit"][]>("gurimaal.api.property.my_unit", { limit }),
  propertyDetail: () =>
    apiClient.method<PropertyResponse | null>("gurimaal.api.property.property_detail"),
  unitDetail: (unit: string) =>
    apiClient.method<PropertyResponse>("gurimaal.api.property.unit_detail", { unit }),
};
