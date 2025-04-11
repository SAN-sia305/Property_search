import { useState } from "react";
import { Property } from "@shared/schema";
import { PropertyCard } from "./property-card";
import { PropertyModal } from "./property-modal";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface PropertyListProps {
  properties: Property[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function PropertyList({ properties, isLoading = false, emptyMessage = "No properties found" }: PropertyListProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 8;
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <div className="w-full h-48 bg-neutral-200 animate-pulse" />
            <div className="p-4">
              <div className="h-6 bg-neutral-200 rounded animate-pulse mb-2" />
              <div className="h-4 bg-neutral-200 rounded animate-pulse mb-4 w-3/4" />
              <div className="flex space-x-2 mb-4">
                <div className="h-4 bg-neutral-200 rounded animate-pulse w-1/4" />
                <div className="h-4 bg-neutral-200 rounded animate-pulse w-1/4" />
                <div className="h-4 bg-neutral-200 rounded animate-pulse w-1/4" />
              </div>
              <div className="flex justify-between">
                <div className="h-5 bg-neutral-200 rounded animate-pulse w-1/3" />
                <div className="h-5 bg-neutral-200 rounded animate-pulse w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (properties.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-neutral-200">
        <h3 className="text-lg font-medium text-neutral-700 mb-2">{emptyMessage}</h3>
        <p className="text-neutral-500">Try adjusting your search filters or check back later for new listings.</p>
      </div>
    );
  }

  const handleOpenModal = (property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Get current page properties
  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = properties.slice(indexOfFirstProperty, indexOfLastProperty);
  const totalPages = Math.ceil(properties.length / propertiesPerPage);

  // Handle next and previous properties in modal
  const handleNextProperty = () => {
    if (!selectedProperty) return;
    
    const currentIndex = currentProperties.findIndex(p => p.id === selectedProperty.id);
    if (currentIndex < currentProperties.length - 1) {
      setSelectedProperty(currentProperties[currentIndex + 1]);
    }
  };

  const handlePreviousProperty = () => {
    if (!selectedProperty) return;
    
    const currentIndex = currentProperties.findIndex(p => p.id === selectedProperty.id);
    if (currentIndex > 0) {
      setSelectedProperty(currentProperties[currentIndex - 1]);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentProperties.map((property) => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            onViewDetails={handleOpenModal} 
          />
        ))}
      </div>
      
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNum = i + 1;
              
              // Show first page, last page, current page and adjacent pages
              if (
                pageNum === 1 || 
                pageNum === totalPages || 
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink 
                      isActive={pageNum === currentPage}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              
              // Show ellipsis
              if (pageNum === 2 && currentPage > 3) {
                return (
                  <PaginationItem key="ellipsis-start">
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              
              if (pageNum === totalPages - 1 && currentPage < totalPages - 2) {
                return (
                  <PaginationItem key="ellipsis-end">
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              
              return null;
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      
      <PropertyModal 
        property={selectedProperty} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        onNext={handleNextProperty}
        onPrevious={handlePreviousProperty}
      />
    </>
  );
}
