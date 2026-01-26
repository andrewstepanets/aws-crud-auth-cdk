import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Link } from 'react-router';
import { useDeleteScenario, useGetAllScenarios } from '../api/hooks';
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
}

interface ActionsMenuProps {
    isEditor: boolean;
    id: string;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

export function ScenariosTable({ isEditor }: ScenarioTableProps) {
    const { data = [], isFetching } = useGetAllScenarios();
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
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return isFetching ? (
        <Loader />
    ) : (
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
