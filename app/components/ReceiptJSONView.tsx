import { FaCopy } from "react-icons/fa";

interface JSONNodeProps {
  keyName?: string;
  data: any;
  depth: number;
}

const truncateValue = (value: string): string => {
  if (value.length > 20) {
    return `${value.slice(0, 10)}...${value.slice(-10)}`;
  }
  return value;
};

const JSONNode: React.FC<JSONNodeProps> = ({ keyName, data, depth }) => {
  if (keyName === "verify") {
    return null;
  }

  if (typeof data === "object" && data !== null) {
    return (
      <div className={`pl-${depth * 4}`}>
        {keyName && <span className="text-blue-600">{keyName}:</span>}
        {Object.keys(data).map((key) => (
          <JSONNode
            key={key}
            keyName={key}
            data={data[key]}
            depth={depth + 1}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`pl-${depth * 4} py-1`}>
      <span className="text-blue-600">{keyName}:</span>
      {typeof data === "string" && (
        <span className="ml-2 text-green-600">
          &quot;{truncateValue(data)}&quot;
        </span>
      )}
      {typeof data === "number" && (
        <span className="ml-2 text-purple-600">{data}</span>
      )}
      {typeof data === "boolean" && (
        <span className="ml-2 text-red-600">{data.toString()}</span>
      )}
    </div>
  );
};

interface ReceiptJSONViewProps {
  data: any;
}

const ReceiptJSONView: React.FC<ReceiptJSONViewProps> = ({ data }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(data);
  };

  return (
    <div className="relative pl-2 border-l-2 border-blue-400">
      <div
        className="absolute top-0 right-0 m-2 transition-transform duration-150 transform cursor-pointer hover:scale-105 active:scale-95"
        onClick={handleCopy}
      >
        <FaCopy
          size={20}
          className="transition-colors duration-150 hover:text-blue-500"
        />
      </div>
      <JSONNode data={JSON.parse(data)} depth={1} />
    </div>
  );
};

export default ReceiptJSONView; // ReceiptJSONView
