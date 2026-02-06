import { Box, Button, DropdownMenu, Flex, Table, Text } from '@radix-ui/themes';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
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
                <Text
                    as="div"
                    style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                    title={info.getValue<string>()}
                >
                    {info.getValue<string>()}
                </Text>
            ),
        },
        {
            header: 'Components',
            cell: ({ row }) => row.original.components.join(', '),
        },
        {
            header: 'Date created',
            cell: ({ row }) => (
                <Box style={{ width: '140px' }}>{new Date(row.original.createdAt).toLocaleDateString()}</Box>
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
        <Box>
            <Table.Root className="scenarios-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                <Table.Header>
                    {table.getHeaderGroups().map(headerGroup => (
                        <Table.Row key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <Table.ColumnHeaderCell key={header.id} className={`col-${header.id}`}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </Table.ColumnHeaderCell>
                            ))}
                        </Table.Row>
                    ))}
                </Table.Header>
                <Table.Body>
                    {table.getRowModel().rows.map(row => (
                        <Table.Row key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <Table.Cell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </Table.Cell>
                            ))}
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
            <Flex gap="2" className="pagination">
                <Button
                    disabled={pageIndex === 0 || isFetching}
                    onClick={() => {
                        setPageIndex(prev => prev - 1);
                    }}
                >
                    Prev
                </Button>
                <Button
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
                </Button>
            </Flex>
        </Box>
    );
}

function ActionsMenu({ isEditor, id, onDelete, isDeleting }: ActionsMenuProps) {
    const navigate = useNavigate();

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <Button variant="outline" color="gray">
                    {isDeleting ? 'Deleting…' : 'Action'}
                    <DropdownMenu.TriggerIcon />
                </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
                <DropdownMenu.Item onClick={() => navigate(`${id}/view`)}>View</DropdownMenu.Item>
                {isEditor && (
                    <>
                        <DropdownMenu.Item onClick={() => navigate(`${id}/edit`)}>Edit</DropdownMenu.Item>
                        <DropdownMenu.Separator />
                        <DropdownMenu.Item color="red" onClick={() => onDelete(id)}>
                            Delete
                        </DropdownMenu.Item>
                    </>
                )}
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
}
