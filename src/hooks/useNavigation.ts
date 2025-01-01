import { useMemo } from "react";
import { useSearchParams } from "react-router";

const useNavigation = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const parentId = useMemo(() => {
    return searchParams.get("parentId");
  }, [searchParams]);

  return {
    parentId,
    navigate: (parentId: string | null) => {
      if (!parentId) {
        setSearchParams({});
        return;
      }
      const urlSearchParams = new URLSearchParams({
        parentId: parentId,
      });
      setSearchParams(urlSearchParams);
    },
  };
};

export default useNavigation;
