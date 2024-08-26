"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ArrowBigLeftDash } from "lucide-react";

import Card from "@/components/card";
import useFetchCardData from "@/hooks/useFetchCardData";
import { CardData } from "@/types/types";
import SelectDropdown from "@/components/SelectDropdown";
import CustomSelect from "@/components/CustomSelect";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
  } from "@tanstack/react-table"
  import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import { Input } from "@/components/ui/input"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define interfaces for Outcome and Booster types
interface SetChance {
  set: string;
  chance: number;
}

interface Outcome {
  commons?: number;
  uncommons?: number;
  rares?: number;
  mythics?: number;
  chance: number;
}

interface BoosterType {
  slot: number;
  set: SetChance[];
  chances: Outcome[];
}

interface Outcomes {
  setbooster: BoosterType[];
  playbooster: BoosterType[];
}

// Sample data for outcomes
const outcomes: Outcomes = {
  setbooster: [
    {
      slot: 1,
      set: [{ set: "main", chance: 100 }],
      chances: [
        { commons: 5, uncommons: 1, chance: 35 },
        { commons: 4, uncommons: 2, chance: 40 },
        { commons: 3, uncommons: 3, chance: 12.5 },
        { commons: 2, uncommons: 4, chance: 7 },
        { commons: 1, uncommons: 5, chance: 3.5 },
        { commons: 0, uncommons: 6, chance: 2 },
      ],
    },
  ],
  playbooster: [
    {
      slot: 2,
      set: [{ set: "main", chance: 100 }],
      chances: [{ commons: 6, chance: 100 }],
    },
    {
      slot: 2,
      set: [
        { set: "main", chance: 98.5 },
        { set: "spg", chance: 1.5 },
      ],
      chances: [{ commons: 1, chance: 100 }],
    },
  ],
};

const Simulator = () => {
  const { slug } = useParams();
  const set = slug as string;
  const { data, loading, error } = useFetchCardData(set);

  const [booster, setBooster] = useState<keyof Outcomes>("setbooster");
  const [simulated, setSimulated] = useState(false);
  const [simulatedCards, setSimulatedCards] = useState<CardData[]>([]);
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome | null>(null);

  // Get the selected outcome based on booster type
  const getSelectedOutcome = (boosterType: keyof Outcomes): Outcome | undefined => {
    const boosterChances = outcomes[boosterType][0].chances;
    const totalChance = boosterChances.reduce((total, chance) => total + chance.chance, 0);
    const randomChoice = Math.random() * totalChance;

    let cumulativeChance = 0;
    for (let chance of boosterChances) {
      cumulativeChance += chance.chance;
      if (randomChoice <= cumulativeChance) {
        return chance;
      }
    }
  };

  // Get random cards from the fetched data
  const getRandomCards = (cards: CardData[], count: number): CardData[] => {
    const shuffled = [...cards].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Simulate the booster pack
  const simulate = () => {
    if (data) {
      setSimulated(true);
      const outcome = getSelectedOutcome(booster);
      setSelectedOutcome(outcome || null);

      // Fetch cards based on the selected outcome
      const commons = data.filter(card => card.rarity === "common");
      const uncommons = data.filter(card => card.rarity === "uncommon");

      // Randomly select cards
      const boosterCommons = getRandomCards(commons, outcome?.commons || 0);
      const boosterUncommons = getRandomCards(uncommons, outcome?.uncommons || 0);

      // Combine all selected cards
      const boosterCards = [...boosterCommons, ...boosterUncommons];
      setSimulatedCards(boosterCards);
    } else {
      setSimulated(false);
    }
  };

  // Simulate on component mount and whenever the set changes
  useEffect(() => {
    simulate();
  }, [set]);

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center bg-gradient-to-r from-black to-gray-800 p-6">

        <div className="w-full max-w-5xl bg-gradient-to-r from-gray-800 via-gray-900 to-white/5 border border-gray-700 shadow-lg rounded-lg p-6">
            <div className='text-center'>
                <h1 className="text-2xl font-bold mb-4 text-gray-200">Welcome to the Simulator!</h1>
                <div className="flex space-x-3 justify-center">
                    <Link
                        href="/sets"
                        className="flex h-10 items-center bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-1 px-4 rounded-md transition duration-300"
                        >
                            <ArrowBigLeftDash />
                    </Link>
                    <SelectDropdown />
                </div>
                <button
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-gray-200 font-bold py-3 px-6 rounded-md transition duration-300 mb-6"
                    onClick={simulate}
                    >
                        Simulate
                </button>
                {loading && <div className="text-lg text-gray-200">Loading...</div>}
                {error && <div className="text-lg text-red-500">{error}</div>}
                {selectedOutcome && (
                    <div className="text-gray-200 text-xl mb-4">
                        <p><strong>Stats:</strong></p>
                        {selectedOutcome.commons !== undefined && <p>Commons: {selectedOutcome.commons}</p>}
                        {selectedOutcome.uncommons !== undefined && <p>Uncommons: {selectedOutcome.uncommons}</p>}
                        {selectedOutcome.rares !== undefined && <p>Rares: {selectedOutcome.rares}</p>}
                        {selectedOutcome.mythics !== undefined && <p>Mythics: {selectedOutcome.mythics}</p>}
                    </div>
                )}
            </div>
            <Tabs defaultValue="table" className="w-full">
                <TabsList className="flex items-center justify-center space-x-4 bg-gray-700/30 p-2 rounded-lg backdrop-blur-lg shadow-md">
                    <TabsTrigger value="table" className="text-white text-lg hover:text-gray-300 transition-all">
                        Table
                    </TabsTrigger>
                    <TabsTrigger value="gallery" className="text-white text-lg hover:text-gray-300 transition-all">
                        Gallery
                    </TabsTrigger>
                    <TabsTrigger value="stacks" className="text-white text-lg hover:text-gray-300 transition-all">
                        Stacks
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="table" className="mt-6">
                    <Table className="w-full text-white">
                        <TableCaption className="text-gray-400">A list of simulated cards.</TableCaption>
                        <TableHeader>
                            <TableRow className="border-b border-gray-600">
                            <TableHead>Rarity</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Type</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {simulatedCards.map((card, index) => (
                            <TableRow key={index} className="border-b border-gray-700 hover:bg-gray-800/50 transition-all">
                                <TableCell className="text-gray-400">{card.rarity}</TableCell>
                                <TableCell></TableCell>
                                <TableCell className="font-medium text-gray-300">{card.name}</TableCell>
                                <TableCell className="text-gray-400">{card.prices?.usd ? `$${card.prices.usd}` : "N/A"}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent>

                <TabsContent value="gallery" className="mt-6">
                    <div className={`w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
                    {simulatedCards.map((card, index) => (
                        <Card
                        key={index}
                        cardName={card.name}
                        cardImage={card.cardImage}
                        prices={card.prices}
                        setCode={card.set}
                        edhrec_link={card.related_uris.edhrec}
                        />
                    ))}
                    </div>
                </TabsContent>

                <TabsContent value="stacks" className="text-white mt-6">
                    Stacks view coming soon...
                </TabsContent>
            </Tabs>
        </div>


    </div>
  );
};

export default Simulator;
