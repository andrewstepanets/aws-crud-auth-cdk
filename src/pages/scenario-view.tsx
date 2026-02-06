import { Badge, Box, Button, Flex, Heading, Tabs, Text } from '@radix-ui/themes';
import { useNavigate, useParams } from 'react-router';
import { useGetScenario, useGetScenarioAudit } from '../api/hooks';
import { useAuth } from '../auth/auth-context';
import { Loader } from '../components/loader';

export default function ScenarioView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { roles } = useAuth();
    const isEditor = roles.includes('editors');
    const redirectToMainPage = () => {
        navigate('/');
    };
    const redirectToEdit = () => {
        navigate(`/${id}/edit`);
    };

    const { data, isLoading, isError } = useGetScenario(id ?? '');
    const { data: auditData, isLoading: isAuditLoading, isError: isAudtitError } = useGetScenarioAudit(id ?? '');

    if (isLoading || isAuditLoading) {
        return <Loader />;
    }

    if (isError || !data || !auditData || isAudtitError) {
        return <Text>Scenario not found</Text>;
    }

    return (
        <Box className="view" width="50%">
            <Heading size="5" mb="4">
                View scenario for ticket {data.ticket}
            </Heading>
            <Tabs.Root defaultValue="details">
                <Tabs.List size="2">
                    <Tabs.Trigger value="details">Details</Tabs.Trigger>
                    <Tabs.Trigger value="audit">Audit trail</Tabs.Trigger>
                </Tabs.List>

                <Box pt="3">
                    <Tabs.Content value="details">
                        <Box asChild>
                            <section className="view-section">
                                <Heading size="3" mb="2">
                                    Title
                                </Heading>
                                <Text as="p" color="gray">
                                    {data.title}
                                </Text>
                            </section>
                        </Box>

                        <Box asChild>
                            <section className="view-section">
                                <Heading size="3" mb="2">
                                    Description
                                </Heading>
                                <Text as="p" color="gray">
                                    {data.description}
                                </Text>
                            </section>
                        </Box>

                        <Box asChild>
                            <section className="view-section">
                                <Heading size="3" mb="2">
                                    Steps
                                </Heading>
                                <Box asChild>
                                    <Tabs.Root defaultValue="Step1">
                                        <Tabs.List>
                                            {data.steps.map((step, index) => (
                                                <Tabs.Trigger key={`${step}-${index}`} value={`Step${index + 1}`}>
                                                    Step {index + 1}
                                                </Tabs.Trigger>
                                            ))}
                                        </Tabs.List>
                                        <Box pt="3">
                                            {data.steps.map((step, index) => (
                                                <Tabs.Content key={`${step}-${index}`} value={`Step${index + 1}`}>
                                                    <Text size="2" color="gray">
                                                        {step}
                                                    </Text>
                                                </Tabs.Content>
                                            ))}
                                        </Box>
                                    </Tabs.Root>
                                </Box>
                            </section>
                        </Box>

                        <Box asChild>
                            <section className="view-section">
                                <Heading size="3" mb="2">
                                    Expected result
                                </Heading>
                                <Text as="p" color="gray">
                                    {data.expectedResult}
                                </Text>
                            </section>
                        </Box>

                        <Box asChild>
                            <section className="view-section">
                                <Heading size="3" mb="2">
                                    Components
                                </Heading>
                                <Flex gap="2" className="components-list">
                                    {data.components.map(component => (
                                        <Badge key={component} className="component-badge">
                                            {component}
                                        </Badge>
                                    ))}
                                </Flex>
                            </section>
                        </Box>
                    </Tabs.Content>

                    <Tabs.Content value="audit">
                        <Box>
                            {auditData.events.map(event => (
                                <Box key={event.requestId} mb="4">
                                    <Flex align="center" gap="2">
                                        <Badge color={event.action === 'CREATE' ? 'green' : 'blue'}>
                                            {event.action}
                                        </Badge>
                                        <Text size="2" weight="medium">
                                            by {event.performedBy}
                                        </Text>
                                    </Flex>

                                    <Text size="1" color="gray">
                                        {new Date(event.timestamp).toLocaleString()}
                                    </Text>
                                </Box>
                            ))}
                        </Box>
                    </Tabs.Content>
                </Box>
            </Tabs.Root>

            <Flex gap="3" mt="6">
                {isEditor && (
                    <Button className="primary-button" onClick={redirectToEdit}>
                        Edit
                    </Button>
                )}
                <Button onClick={redirectToMainPage} variant="soft">
                    Cancel
                </Button>
            </Flex>
        </Box>
    );
}
