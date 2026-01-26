import { useNavigate, useParams } from 'react-router';
import { useGetScenario } from '../api/hooks';
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

    if (isLoading) {
        return <Loader />;
    }

    if (isError || !data) {
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
