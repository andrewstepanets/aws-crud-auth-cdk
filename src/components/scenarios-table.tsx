import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useDeleteScenario, useGetAllScenarios } from '../api/hooks';
import { SearchParams } from '../api/types';
import { Loader } from './loader';

export interface Scenario {
    id: string;
    ticket: string;
    title: string;
    description: string;
    components: string[];
    createdAt: string;
}

interface ScenarioTableProps {
    isEditor: boolean;
    params?: SearchParams;
}

interface ActionsMenuProps {
    isEditor: boolean;
    id: string;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

type PaginationStack = (string | undefined)[];

export function ScenariosTable({ isEditor, params }: ScenarioTableProps) {
    const [keysStack, setKeysStack] = useState<PaginationStack>([undefined]);
    const [pageIndex, setPageIndex] = useState(0);
    const [prevCreatedBy, setPrevCreatedBy] = useState<string | undefined>(undefined);

    const filtersChanged = params?.createdBy !== prevCreatedBy;

    useEffect(() => {
        if (filtersChanged) {
            setKeysStack([undefined]);
            setPageIndex(0);
            setPrevCreatedBy(params?.createdBy);
        }
    }, [params?.createdBy, filtersChanged]);

    const nextKey = filtersChanged ? undefined : keysStack[pageIndex];

    const { data, isFetching } = useGetAllScenarios({
        ...params,
        nextKey,
    });
    const scenarios = data?.items ?? [];

    const { mutate: deleteScenario, isPending, variables: deletingId } = useDeleteScenario();

    const columns: ColumnDef<Scenario>[] = [
        {
            header: 'Ticket',
            accessorKey: 'ticket',
        },
        {
            header: 'Title',
            accessorKey: 'title',
        },
        {
            header: 'Description',
            accessorKey: 'description',
            cell: info => (
                <div
                    style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                    title={info.getValue<string>()}
                >
                    {info.getValue<string>()}
                </div>
            ),
        },
        {
            header: 'Components',
            cell: ({ row }) => row.original.components.join(', '),
        },
        {
            header: 'Date created',
            cell: ({ row }) => (
                <div style={{ width: '140px' }}>{new Date(row.original.createdAt).toLocaleDateString()}</div>
            ),
        },
        {
            header: 'Actions',
            cell: ({ row }) => (
                <ActionsMenu
                    isEditor={isEditor}
                    id={row.original.id}
                    onDelete={deleteScenario}
                    isDeleting={isPending && deletingId === row.original.id}
                />
            ),
        },
    ];

    const table = useReactTable({
        data: scenarios,
        columns,
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
    });

    return isFetching ? (
        <Loader />
    ) : (
        <div>
            <table className="scenarios-table">
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className={`col-${header.id}`}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                <button
                    disabled={pageIndex === 0 || isFetching}
                    onClick={() => {
                        setPageIndex(prev => prev - 1);
                    }}
                >
                    Prev
                </button>
                <button
                    disabled={!data?.nextKey || isFetching}
                    onClick={() => {
                        setKeysStack(prev => {
                            const nextIndex = pageIndex + 1;

                            if (prev[nextIndex]) {
                                return prev;
                            }

                            const copy = [...prev];
                            copy[nextIndex] = data?.nextKey;
                            return copy;
                        });
                        setPageIndex(prev => prev + 1);
                    }}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

function ActionsMenu({ isEditor, id, onDelete, isDeleting }: ActionsMenuProps) {
    return (
        <div className="actions-wrapper">
            <button className="actions-button" disabled={isDeleting}>
                {isDeleting ? 'Deleting…' : 'Action'}
            </button>

            <div className="actions-dropdown">
                <Link className="actions-item" to={{ pathname: `${id}/view` }}>
                    View
                </Link>

                {isEditor && (
                    <>
                        <Link className="actions-item" to={{ pathname: `${id}/edit` }}>
                            Edit
                        </Link>
                        <button className="actions-item danger" onClick={() => onDelete(id)}>
                            Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
