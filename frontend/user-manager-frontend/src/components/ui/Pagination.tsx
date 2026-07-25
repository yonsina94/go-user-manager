interface PaginationProps{
    currentPage: number
    pageSize: number
    totalItems: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
}

export const Pagination = ({
    currentPage,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [5, 10, 20, 50, 100]}: PaginationProps) => {
const totalPages = Math.ceil(totalItems / pageSize) || 1

const startItem = totalItems == 0 ? 0 : (currentPage - 1) * pageSize + 1
const endItem = Math.min(currentPage * pageSize, totalItems)

const getPageNumbers = () => {
    const pages: number[] = []

    let start = Math.max(1, currentPage - 2)
    let end = Math.min(totalPages, start + 4)

    if (end - start < 4) {
        start = Math.max(1, end - 4)
    }

  for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        return pages;

}

 return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400">
          
          {/* Información de Registros y Selector por página */}
          <div className="flex items-center gap-3">
            <span>
              Mostrando <strong className="text-gray-900 dark:text-white">{startItem}</strong> a{" "} <strong className="text-gray-900 dark:text-white">{endItem}</strong> de{" "}<strong className="text-gray-900 dark:text-white">{totalItems}</strong> resultados
            </span>
    
            <div className="flex items-center space-x-1.5 ml-4">
              <span className="text-xs">Por página:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent  text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option} className="dark:bg-gray-900 dark:text-white">
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
    
          {/* Botones de Navegación */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Primera Página"
            >
              «
            </button>
    
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Página Anterior"
            >
              ‹
            </button>
    
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  pageNum === currentPage
                    ? "bg-purple-600 text-white shadow-sm"
                    : "border border-gray-200  dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Página Siguiente"
            >
              ›
            </button>

            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Última Página"
            >
              »
            </button>
          </div>
        </div>
      );

}