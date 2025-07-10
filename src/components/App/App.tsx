import { useState, useCallback } from "react";
import { Toaster, toast } from "react-hot-toast";
import { fetchMovies } from "../../services/movieService";
import type { Movie } from "../../types/movie";
import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieModal from "../MovieModal/MovieModal";
import "modern-normalize/modern-normalize.css";

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setError(false);
      setMovies([]);

      const movies = await fetchMovies(query);

      if (!movies.length) {
        toast.error("No movies found for your request");
        return;
      }

      setMovies(movies);
    } catch (error) {
      setError(true);
      console.error("Fetch movies error:", error);
      toast.error(
        error instanceof Error
          ? `Failed to fetch movies: ${error.message}`
          : "Failed to fetch movies"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedMovie(null);
  }, []);

  const renderContent = () => {
    if (isLoading) return <Loader />;
    if (error) return <ErrorMessage />;
    if (movies.length === 0) return null;

    return <MovieGrid movies={movies} onSelect={setSelectedMovie} />;
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
      {renderContent()}

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={handleCloseModal} />
      )}
    </>
  );
}
