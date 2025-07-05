const COLOR_MAP: Record<string, string> = {
    '1': 'var(--color-mana-blue)',
    '2': 'var(--color-mana-green)',
    '3': 'var(--color-mana-green)',
    '4': 'var(--color-mana-green)',
    '5': 'var(--color-mana-green)',
    'X': 'var(--color-mana-red)'
}

export default function TinyChart({ data } : { data: { label: string, value: number }[] }) {
    const max = data.reduce((a, v) => Math.max(a, v.value), 0);
    const sum = data.reduce((a, v) => a + v.value, 0);
    return (
        <div className="flex flex-col h-[200px]">
            <div className="flex flex-row items-end flex-grow-1">
                {data.map((datum, idx) => {
                    return <div
                    key={idx}
                    style={{
                        background: `${COLOR_MAP[datum.label]}`,
                        height: `calc(100% * ${datum.value} / ${max})`,
                        width: `calc(100% / ${data.length})`}}
                        className={`p-1 text-center text-black md:mx-4 rounded-md`}>
                        <span
                            className={` ${datum.value <= (sum / 20) ? `rounded-full p-1 relative top-[-36px]` : '' }`}
                            style={{ background: `${COLOR_MAP[datum.label]}` }}
                            >×{datum.value}</span>
                </div>
                })}
            </div>
            <div className="flex flex-row">
                {data.map((datum, idx) => {
                    return <div key={idx} className="text-center" style={{ height: `30px`, width: `calc(100% / ${data.length})`}}>{datum.label}</div>
                })}
            </div>
        </div>
    );
}