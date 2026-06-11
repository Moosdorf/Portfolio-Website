function Education() {
  return (
    <div className="education-page text-left text-black p-5 py-10">
      <h1>Education</h1>
      <h2>University: RUC</h2>
      <ul className="p-5">
        <li className="mb-2 px-5">2021-2024: Bachelor of Science in Computer Science and Informatics, RUC.</li>
        <li className="mb-2 px-5">2024-2026: Master of Science in Computer Science, RUC.</li>
      </ul>

      <h2>High School: Egedal Gymnasium og HF</h2>
      <ul className="p-5">
        <li className="mb-2 px-5">2015-2017: HF Diploma from Egedal Gymnasium og HF.</li>
        <li className="mb-2 px-5">2017-2021: Additional classes 
          <ul className="px-15">
            <li>Math C to A</li>
            <li>Physics 0 to A</li>
            <li>Chemistry C to B</li>
          </ul>
        </li>
      </ul>
    </div>
  )
}


export default Education