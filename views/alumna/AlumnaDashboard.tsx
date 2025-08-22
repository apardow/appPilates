import { lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import { useAlumnaDashboard } from "../../hooks/useAlumnaDashboard";

const ResumenPanel = lazy(() => import("./panels/ResumenPanel"));
const PlanesPanel = lazy(() => import("./panels/PlanesPanel"));
const ActividadesPanel = lazy(() => import("./panels/ActividadesPanel"));
const PagosPanel = lazy(() => import("./panels/PagosPanel"));
const DocumentosPanel = lazy(() => import("./panels/DocumentosPanel"));

export default function AlumnaDashboard() {
  const { id: alumnaId } = useParams<{ id: string }>();
  const vm = useAlumnaDashboard(alumnaId);

  if (vm.state === "loading" && !vm.data.resumen) {
    return <div className="p-6 text-sm text-gray-500">Cargando…</div>;
  }
  if (vm.state === "error") {
    return (
      <div className="p-6 text-red-600">
        Error: {vm.error?.message ?? "No se pudo cargar la información."}
        <button className="ml-3 px-3 py-1 rounded bg-gray-900 text-white" onClick={vm.reload}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <Suspense fallback={<div className="p-3">Cargando resumen…</div>}>
        <ResumenPanel resumen={vm.data.resumen} totalPagado={vm.totalPagado} />
      </Suspense>

      <Suspense fallback={<div className="p-3">Cargando planes…</div>}>
        <PlanesPanel planes={vm.data.planes} />
      </Suspense>

      <Suspense fallback={<div className="p-3">Cargando actividades…</div>}>
        <ActividadesPanel actividades={vm.actividadesFuturas} />
      </Suspense>

      <Suspense fallback={<div className="p-3">Cargando pagos…</div>}>
        <PagosPanel pagos={vm.data.pagos} />
      </Suspense>

      <Suspense fallback={<div className="p-3">Cargando documentos…</div>}>
        <DocumentosPanel
          documentos={vm.data.documentos}
          onUpload={vm.uploadClienteDocumento}
          onDelete={vm.deleteClienteDocumento}
          onRefresh={vm.reload}
        />
      </Suspense>
    </div>
  );
}
