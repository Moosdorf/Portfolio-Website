import { useEffect, useState } from "react";
import { API_URL } from "../../config";

export type WebsiteProject = {
    description: string;
    id: number;
    path: string;
    title: string;
};

const SECTIONS = [
    { id: "overview", label: "Overview" },
    { id: "tech-stack", label: "Tech Stack" },
    { id: "api", label: "API" },
    { id: "signalr-vs-https", label: "SignalR vs HTTPS" },
    { id: "security", label: "Security" },
    { id: "testing", label: "Testing" },
    { id: "deployment", label: "Deployment" },
];

function WebsiteProject() {
    const [websiteProject, setProject] = useState<WebsiteProject>();

    useEffect(() => {
        fetch(`${API_URL}/api/Projects/0`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
            .then((data) => data.json())
            .then((json) => setProject(json));
    }, []);

    if (!websiteProject) {
        return (
            <div className="w-full p-5">
                <h1 className="text-2xl font-bold">Loading project...</h1>
            </div>
        );
    }

    return (
        <div className="w-full p-5">
            <header className="mb-10">
                <h1 className="text-2xl font-bold">{websiteProject.title}</h1>
                <p className="text-sm text-gray-500 mt-1">{websiteProject.description}</p>
            </header>

            <div className="flex flex-col-reverse md:flex-row gap-10">
                <div className="flex-1 border border-gray-100 rounded-lg p-8">
                    {SECTIONS.map((section) => (
                        <section key={section.id} id={section.id} className="py-6 first:pt-0 last:pb-0 scroll-mt-5">
                            <h2 className="text-lg font-semibold mb-3 border-b border-gray-300 pb-2">
                                {section.label}
                            </h2>
                            <p className="text-sm text-gray-400">
                                123
                            </p>
                        </section>
                    ))}
                </div>

                <nav className="md:w-32 shrink-0">
                    <ul className="md:sticky md:top-5 flex flex-row md:flex-col flex-wrap gap-x-3 gap-y-0.5 text-xs">
                        {SECTIONS.map((section) => (
                            <li key={section.id}>
                                <a href={`#${section.id}`} className="block py-0.5 text-gray-500 hover:text-gray-900">
                                    {section.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    );
}

export default WebsiteProject;