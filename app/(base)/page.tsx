export default function Home() {
  console.log("yes", process.env.DATABASE_URL);
  return <main>Hello</main>;
}
