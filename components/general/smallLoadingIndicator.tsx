export default function SmallLoadingIndicator({}) {
  return (
    <div className="flex h-1 w-full scale-50 items-center justify-center">
      <svg className="svg" viewBox="25 25 50 50">
        <circle className="circle" r="20" cy="50" cx="50"></circle>
      </svg>
    </div>
  );
}
