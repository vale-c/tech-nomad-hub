'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Hero from './hero';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  groupItemsByCategory,
  getPriorityItems,
  formatCountryName,
} from '../utils';
import { CountryImage } from './country-image';
import { useCountryImages } from '../hooks/use-country-images';

interface CountryCardListProps {
  initialData: [string, { item: string; price: number }[]][];
  currentPage: number;
  totalPages: number;
  rowsPerPage?: number;
  imageMap: Record<string, string>;
  searchCountry: (query: string) => Promise<
    [
      string,
      {
        item: string;
        price: number;
      }[]
    ][]
  >;
  stats: {
    averageRentCityCenter: number;
    averageInternetSpeed: number;
    averageCoffeePrice: number;
    totalCountries: number;
  };
}

export default function CountryCardList({
  initialData,
  currentPage,
  totalPages,
  imageMap,
  searchCountry,
  stats,
}: CountryCardListProps) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const countries = data.map(([country]) => country);
  const { images, isLoading } = useCountryImages(countries, imageMap);
  const [selectedCountry, setSelectedCountry] = useState<null | {
    country: string;
    items: { item: string; price: number }[];
  }>(null);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handlePageChange = async (page: number) => {
    if (page > 0 && page <= totalPages) {
      await router.push(`/cost-of-living?page=${page}`, {
        scroll: false,
      });
    }
  };

  const handleSearchQuery = async (
    query: string
  ): Promise<[string, { item: string; price: number }[]][]> => {
    if (query.trim() === '') {
      setData(initialData); // Reset to initial data when query is cleared
      setIsSearchActive(false); // Disable search mode
      return initialData; // Return initial data
    } else {
      const filteredData = await searchCountry(query);
      setData(filteredData); // Update data with filtered results
      setIsSearchActive(true); // Enable search mode
      return filteredData; // Return filtered data
    }
  };

  const getCountryImage = (country: string): string =>
    images[country] || '/images/placeholder.jpg';

  const optimizedCategoryOrder = [
    'Housing',
    'Food & Drinks',
    'Transportation',
    'Utilities',
    'Entertainment & Fitness',
    'Other Costs',
  ];

  return (
    <>
      <Hero searchCountry={handleSearchQuery} stats={stats} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map(([country, items]) => {
          const priorityItems = getPriorityItems(items);
          return (
            <Card
              key={country}
              className="flex flex-col h-full shadow-lg hover:shadow-2xl transition-shadow duration-200 cursor-zoom-in"
              onClick={() => setSelectedCountry({ country, items })}
            >
              <CountryImage
                src={getCountryImage(country)}
                alt={`${country} landscape`}
                isLoading={isLoading}
              />
              <CardHeader>
                <CardTitle className="mt-4 text-center text-xl font-semibold">
                  {formatCountryName(country)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {priorityItems.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex justify-between">
                      <span>
                        {item.emoji} {item.item}
                      </span>
                      <span>${item.price.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Conditional Pagination */}
      {!isSearchActive && (
        <div className="flex justify-center items-center mt-8">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="mx-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modal */}
      <Dialog
        open={!!selectedCountry}
        onOpenChange={() => setSelectedCountry(null)}
      >
        <DialogContent className="max-w-4xl w-full h-[90vh] overflow-hidden p-0">
          {selectedCountry && (
            <>
              <div className="relative w-full h-48 -mt-6">
                <Image
                  src={getCountryImage(selectedCountry.country)}
                  alt={`${selectedCountry.country} landscape`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>

              <DialogHeader className="flex-shrink-0 px-6 py-4">
                <DialogTitle className="text-2xl font-bold">
                  {formatCountryName(selectedCountry.country)}
                </DialogTitle>
                <DialogDescription>
                  Cost of living details for{' '}
                  {formatCountryName(selectedCountry.country)}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-grow overflow-y-auto px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {optimizedCategoryOrder.map((category) => {
                    const items = groupItemsByCategory(selectedCountry.items)[
                      category
                    ];
                    if (!items) return null;

                    return (
                      <div key={category}>
                        <h3 className="text-xl font-semibold mb-2 flex items-center">
                          {items[0]?.emoji || '📦'} {category}
                        </h3>
                        <ul className="space-y-1">
                          {items.map((item, index) => (
                            <li key={index} className="flex justify-between">
                              <span>{item.item}</span>
                              <span>${item.price.toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>

              <DialogFooter className="flex-shrink-0 px-6 py-4">
                <Button onClick={() => setSelectedCountry(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
