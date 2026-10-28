import { useLocation, useNavigate } from "react-router";
import { filtersFromSearch, GameFilters } from "../logic/filters";
import { useEffect } from "react";

export function useFiltersFromUrl(path: string, apply: (filters: GameFilters) => void) {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (pathname !== path) return;
    const filters = filtersFromSearch(search);
    if (!filters) return;
    apply(filters);
    navigate(pathname, {replace: true})
  }, [pathname, path, search, apply, navigate]);
}