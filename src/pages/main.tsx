interface MainPageProps {
    isEditor: boolean;
}

export function MainPage({ isEditor }: MainPageProps) {
    return <main className="main">{isEditor && <button className="primary-button">+ Add Scenario</button>}</main>;
}
