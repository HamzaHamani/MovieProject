import { CarouselExplore } from "@/components/explore/carouselExplore";
import { Button } from "@/components/ui/button";
import { getSpecifiedMovie } from "@/lib/actions";
import { TexploreApiSchema, TspecifiedMovie } from "@/types/api";
// React and Next.js imports
import Image from "next/image";
import Link from "next/link";

// Third-party library imports
import Balancer from "react-wrap-balancer";
import { ArrowRight } from "lucide-react";

// Local component imports

// Asset imports
import Placeholder from "@/public/placeholder.jpg";

import { Metadata } from "next";
import { cn } from "@/lib/utils";
// Section Component
type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

const Section = ({ children, className, id }: SectionProps) => {
  return (
    <section className={cn("py-8 md:py-12", className)} id={id}>
      {children}
    </section>
  );
};

// Container Component
type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

const Container = ({ children, className, id }: ContainerProps) => {
  return (
    <div className={cn("mx-auto max-w-5xl", "p-6 sm:p-8", className)} id={id}>
      {children}
    </div>
  );
};

export const metadata: Metadata = {
  title: "Explore",
};
type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

let specifiedMovie: TspecifiedMovie;

export default async function Explore({ searchParams }: Props) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1&api_key=${process.env.TMDB_API_KEY}`,

    { next: { revalidate: 3600 } },
  );
  const result = await res.json();
  const data: TexploreApiSchema[] = result.results;

  if (searchParams.movie) {
    specifiedMovie = await getSpecifiedMovie(searchParams.movie as string);
  }
  return (
    <div className="h-screen">
      {/* <div
        className="absolute top-0 -z-10 h-screen w-full object-cover opacity-70"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original/${specifiedMovie?.backdrop_path})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      /> */}

      {/* <div className="flex h-[91.5vh] flex-col justify-between">
        <div></div>
         <CarouselExplore data={data} />
      </div> */}

      <Section>
        <Container>
          <div>
            <Button
              asChild
              className="mb-6 w-fit"
              size={"sm"}
              variant={"outline"}
            >
              <Link className="not-prose" href="https://9d8.dev">
                Lorem ipsum dolor sit amet <ArrowRight className="w-4" />
              </Link>
            </Button>
            <h1>
              <Balancer>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit
              </Balancer>
            </h1>
            <h3 className="text-muted-foreground">
              <Balancer>
                Sed do eiusmod tempor incididunt ut labore et dolore magna
                aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Sed do eiusmod tempor incididunt ut labore et dolore magna
                aliqua.
              </Balancer>
            </h3>
            <div className="not-prose my-8 h-96 w-full overflow-hidden rounded-lg border md:h-[480px] md:rounded-xl">
              <img
                className="h-full w-full object-cover object-bottom"
                src={
                  "https://images.unsplash.com/photo-1553696590-4b3f68898333?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                }
                width={1920}
                height={1080}
                alt="hero image"
              />
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
