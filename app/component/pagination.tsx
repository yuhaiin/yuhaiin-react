import { Pagination } from "react-bootstrap";


export function CustomPagination({
    currentPage,
    totalItems,
    pageSize,
    onPageChange,
}: {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}) {
    const totalPages = Math.ceil(totalItems / pageSize);
    const pages: (number | 'ellipsis')[] = [];

    const maxVisible = 5;
    const side = 2;

    if (totalPages <= maxVisible + 2) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        if (currentPage <= side + 2) {
            for (let i = 1; i <= maxVisible; i++) pages.push(i);
            pages.push('ellipsis');
            pages.push(totalPages);
        } else if (currentPage >= totalPages - side - 1) {
            pages.push(1);
            pages.push('ellipsis');
            for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push('ellipsis');
            for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
            pages.push('ellipsis');
            pages.push(totalPages);
        }
    }

    return (
        <div>
            <Pagination>
                <Pagination.Prev
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                />
                {pages.map((item, idx) =>
                    item === 'ellipsis' ? (
                        <Pagination.Ellipsis key={'e' + idx} disabled />
                    ) : (
                        <Pagination.Item
                            key={item}
                            active={item === currentPage}
                            onClick={() => onPageChange(item)}
                        >
                            {item}
                        </Pagination.Item>
                    )
                )}
                <Pagination.Next
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                />
            </Pagination>
        </div>
    );
}