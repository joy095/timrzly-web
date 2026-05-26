import { Button } from "@/components/ui/button";
import { ArrowUpIcon } from "lucide-react";
import Image from "next/image";

export default function TestPage() {
  return (
    <div>
      <Image
        src="/images/elephant.jpg"
        alt="Elephant image"
        height={100}
        width={150}
      />

      <div className="flex flex-wrap items-center gap-2 md:flex-row">
        <Button variant="outline">Button</Button>
        <Button variant="outline" size="icon" aria-label="Submit">
          <ArrowUpIcon />
        </Button>
      </div>
    </div>
  );
}
