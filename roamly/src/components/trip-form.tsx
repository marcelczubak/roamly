"use client";

import { useState } from "react";
import { ArrowRight, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  INTEREST_OPTIONS,
  TRAVEL_STYLES,
  type TripRequest,
} from "@/lib/schemas";

type TripFormProps = {
  onSubmit: (data: TripRequest) => void;
  isLoading?: boolean;
};

const STYLE_LABELS: Record<(typeof TRAVEL_STYLES)[number], string> = {
  backpacker: "Backpacker",
  "mid-range": "Mid-range",
  luxury: "Luxury",
};

export function TripForm({ onSubmit, isLoading }: TripFormProps) {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("5");
  const [style, setStyle] = useState<(typeof TRAVEL_STYLES)[number]>("mid-range");
  const [interests, setInterests] = useState<string[]>(["Food", "Nature"]);
  const [error, setError] = useState("");

  function toggleInterest(interest: string) {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const parsedBudget = Number(budget);

    if (!destination.trim()) {
      setError("Please enter a destination.");
      return;
    }

    if (!parsedBudget || parsedBudget <= 0) {
      setError("Please enter a valid budget.");
      return;
    }

    if (interests.length === 0) {
      setError("Select at least one interest.");
      return;
    }

    onSubmit({
      destination: destination.trim(),
      budget: parsedBudget,
      days: Number(days),
      style,
      interests,
    });
  }

  return (
    <Card className="border-white/60 bg-white/80 shadow-xl shadow-primary/5 backdrop-blur-sm">
      <CardHeader>
        <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <Plane className="size-5 text-primary" />
        </div>
        <CardTitle className="text-xl">Plan your trip</CardTitle>
        <CardDescription className="text-sm">
          Tell us where you want to go and we&apos;ll build your itinerary in
          seconds.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              placeholder="e.g. Tokyo, Lisbon, Barcelona"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              className="h-10 bg-white text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="budget">Total budget (€)</Label>
              <Input
                id="budget"
                type="number"
                min={1}
                placeholder="1500"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                className="h-10 bg-white text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Trip length</Label>
              <Select
                value={days}
                onValueChange={(value) => value && setDays(value)}
              >
                <SelectTrigger className="h-10 w-full bg-white text-sm">
                  <SelectValue placeholder="Days" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 14 }, (_, index) => index + 1).map(
                    (day) => (
                      <SelectItem key={day} value={String(day)}>
                        {day} {day === 1 ? "day" : "days"}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Travel style</Label>
            <div className="grid grid-cols-3 gap-2">
              {TRAVEL_STYLES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStyle(option)}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-xs font-medium transition-all",
                    style === option
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-white text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {STYLE_LABELS[option]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Interests</Label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => {
                const selected = interests.includes(interest);

                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                      selected
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-white text-muted-foreground hover:border-primary/20 hover:text-foreground"
                    )}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          <Button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full text-sm font-medium"
            size="lg"
          >
            {isLoading ? "Generating..." : "Generate Itinerary"}
            {!isLoading ? <ArrowRight className="size-4" /> : null}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
