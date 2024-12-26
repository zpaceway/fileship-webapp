import { useCallback, useEffect, useRef, useState } from "react";
import { TBucket } from "../types";
import { fileshipFetch } from "../api";

const useBuckets = () => {
  const [buckets, setBuckets] = useState<TBucket[]>([]);
  const isFetchingBucketsRef = useRef(false);

  const refreshBuckets = useCallback(async () => {
    fileshipFetch("/buckets/")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch buckets");
        }
        const { result } = await response.json();
        setBuckets(result);
      })
      .catch(() => {
        setBuckets([]);
      });
  }, []);

  const createBucket = useCallback(async (name: string) => {
    fileshipFetch("/buckets/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to create bucket");
        }
      })
      .catch(() => {});
  }, []);

  const deleteBucket = useCallback(async (bucketId: string) => {
    fileshipFetch(`/buckets/${bucketId}/`, {
      method: "DELETE",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to create bucket");
        }
      })
      .catch(() => {});
  }, []);

  const shareBucket = useCallback(async (bucketId: string, email: string) => {
    fileshipFetch(`/buckets/${bucketId}/share/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to create bucket");
        }
      })
      .catch(() => {});
  }, []);

  const renameBucket = useCallback(async (bucketId: string, name: string) => {
    fileshipFetch(`/buckets/${bucketId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to create bucket");
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;

    const wrapped = async () => {
      if (!mounted) return;
      if (isFetchingBucketsRef.current) return;
      isFetchingBucketsRef.current = true;
      if (mounted) await refreshBuckets().catch(() => null);
      isFetchingBucketsRef.current = false;
      await new Promise((res) => setTimeout(res, 500));
      if (!mounted) return;
      await wrapped();
    };

    wrapped();

    return () => {
      mounted = false;
      isFetchingBucketsRef.current = false;
    };
  }, [refreshBuckets]);

  return {
    buckets,
    refreshBuckets,
    createBucket,
    deleteBucket,
    renameBucket,
    shareBucket,
  };
};

export default useBuckets;
