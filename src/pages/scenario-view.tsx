import * as Accordion from '@radix-ui/react-accordion';
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
        return <div>Scenario not found</div>;
    }

    return (
        <div className="view">
            <h2>View scenario</h2>

            <section className="view-section">
                <h3>Ticket</h3>
                <p>{data.ticket}</p>
            </section>

            <section className="view-section">
                <h3>Title</h3>
                <p>{data.title}</p>
            </section>

            <section className="view-section">
                <h3>Description</h3>
                <p>{data.description}</p>
            </section>

            <section className="view-section">
                <h3>Steps</h3>
                <ul>
                    {data.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                    ))}
                </ul>
            </section>

            <section className="view-section">
                <h3>Expected result</h3>
                <p>{data.expectedResult}</p>
            </section>

            <section className="view-section">
                <h3>Components</h3>
                <div className="components-list">
                    {data.components.map(component => (
                        <span key={component} className="component-badge">
                            {component}
                        </span>
                    ))}
                </div>
            </section>

            <section className="view-section">
                <h3>Audit history</h3>

                <Accordion.Root type="single" collapsible>
                    <Accordion.Item value="audit">
                        <Accordion.Header>
                            <Accordion.Trigger>View history</Accordion.Trigger>
                        </Accordion.Header>

                        <Accordion.Content>
                            <ul className="audit-list">
                                {auditData.events.map(event => (
                                    <li key={event.requestId} className="audit-item">
                                        <div>
                                            <strong>{event.action}</strong>
                                            {' by '}
                                            {event.performedBy}
                                        </div>
                                        <div>Ticket {event.ticket}</div>
                                        <div>{new Date(event.timestamp).toLocaleString()}</div>
                                    </li>
                                ))}
                            </ul>
                        </Accordion.Content>
                    </Accordion.Item>
                </Accordion.Root>
            </section>

            <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                {isEditor && (
                    <button className="primary-button" onClick={redirectToEdit}>
                        Edit
                    </button>
                )}
                <button onClick={redirectToMainPage}>Cancel</button>
            </div>
        </div>
    );
}
