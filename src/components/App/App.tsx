import { useState, useCallback, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { fetchMovies } from "../../services/movieService";
import type { Movie } from "../../types/movie";
import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieModal from "../MovieModal/MovieModal";
import ReactPaginate from "react-paginate";
import css from "./App.module.css";
import "modern-normalize/modern-normalize.css";

export default function App() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const { data, isLoading, isError, error, isFetching } = useQuery<
    ReturnType<typeof fetchMovies> extends Promise<infer R> ? R : never,
    Error
  >({
    queryKey: ["movies", query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: !!query,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (error) {
      toast.error(
        error instanceof Error
          ? `Failed to fetch movies: ${error.message}`
          : "Failed to fetch movies"
      );
    }
    if (data && data.results.length === 0 && !isLoading && !isFetching) {
      toast.error("No movies found for your request");
    }
  }, [error, data, isLoading, isFetching]);

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    setPage(1);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedMovie(null);
  }, []);

  const renderContent = () => {
    if (isLoading) return <Loader />;
    if (isError) return <ErrorMessage />;
    if (!data || data.results.length === 0) return null;

    return <MovieGrid movies={data.results} onSelect={setSelectedMovie} />;
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          error: {
            duration: 5000,
          },
        }}
      />

      <SearchBar onSubmit={handleSearch} />
      {data && data.total_pages > 1 && (
        <ReactPaginate
          pageCount={data.total_pages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => setPage(selected + 1)}
          forcePage={page - 1}
          containerClassName={css.pagination}
          activeClassName={css.active}
          nextLabel="→"
          previousLabel="←"
        />
      )}
      {renderContent()}

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={handleCloseModal} />
      )}
    </>
  );
}
