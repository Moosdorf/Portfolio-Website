import ProjectContainer from "../components/ProjectContainer";

function Home() {
  
  return (
    <div className="w-7/12 mx-auto p-5 space-y-6">
      <h1 className="text-2xl font-bold">Andreas Moosdorf's Portfolio</h1>

      <ProjectContainer />

      <div className="border border-gray-300 rounded-lg p-5
                      flex flex-col items-center gap-4
                      sm:flex-row sm:flex-wrap sm:justify-around">
        <h2 className="text-lg font-semibold">About me</h2>
      </div>

      <div className="border border-gray-300 rounded-lg p-5
                      flex flex-col gap-3">

        <h1 className="text-xl font-bold">Education</h1>

        <div className="flex flex-col gap-2">
          <h2 className="text-base font-semibold">University: RUC</h2>
          <ul className="flex flex-col gap-1.5 pl-5 list-disc text-sm">
            <li>2021-2024: Bachelor of Science in Computer Science and Informatics, RUC.</li>
            <li>2024-2026: Master of Science in Computer Science, RUC.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

export default Home;