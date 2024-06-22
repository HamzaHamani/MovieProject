type Props = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function page({ params, searchParams }: Props) {
  console.log(searchParams);
  const { id } = params;
  return <div>specified {id}</div>;
}
