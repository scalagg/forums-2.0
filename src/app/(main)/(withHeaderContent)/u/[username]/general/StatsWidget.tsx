export interface StatEntry {
  label: string;
  value: string | number;
}

export interface Props {
  title: string,
  entries: StatEntry[],
  backgroundImage: string,
}

export default function StatsWidget(props: Props) {
  const { title, entries, backgroundImage } = props;
  const widgetStyle = {
    backgroundColor: "#505050",
    backgroundImage: `url(${backgroundImage})`,
    backgroundBlendMode: "lighten",
  }

  return (
    <div className="rounded-lg max-w-[350px] min-w-[250px] min-h-[300px] p-2 text-center shadow-inner bg-full" style={widgetStyle}>
      <div className="flex flex-col gap-2 p-3 bg-gray-800/[90%] rounded-lg h-[100%] w-[100%]">
        <h4 className="font-extrabold text-2xl mx-5 text-white mb-4">{title}</h4>
        <div className="flex flex-col gap-2 mt-3 justify-center">
          {entries.map((entry, idx) => (
            <div key={idx} className="flex flex-col items-center bg-gray-900/[85%] rounded-lg py-2 px-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300">{entry.label}</span>
              <span className="text-xl font-extrabold text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
