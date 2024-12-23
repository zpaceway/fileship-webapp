import { useMemo } from "react";
import { useSearchParams } from "react-router";

const useNavigation = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pathIdsString = useMemo(() => {
    return searchParams.get("pathIds") || "";
  }, [searchParams]);
  const pathsIds = useMemo(() => {
    return pathIdsString.split("/").filter(Boolean);
  }, [pathIdsString]);
  const currentPathId = useMemo(() => {
    return pathsIds.length >= 1 ? pathsIds.slice(-1)[0]! : null;
  }, [pathsIds]);
  const prevPathId = useMemo(() => {
    return pathsIds.length > 1
      ? pathsIds.slice(-2)[0]!
      : currentPathId
        ? null
        : undefined;
  }, [currentPathId, pathsIds]);

  return {
    currentPathId,
    prevPathId,
    pathIdsString,
    navigate: (path: string) => {
      const urlSearchParams = new URLSearchParams({
        pathIds: path,
      });
      setSearchParams(urlSearchParams);
    },
  };
};

export default useNavigation;
