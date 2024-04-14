export async function uploadContent({
  content,
  address,
}: {
  content: string;
  address: string;
}) {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const res = await fetch(`${BASE_URL}/api/v1/frames`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      address,
    }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error("Error uploading content");
  }
  if (!data.ipfsHash) {
    throw new Error("No IPFS hash found");
  }
  return data;
}

export async function syncContent({
  ipfsHash,
  transactionHash,
}: {
  ipfsHash: string;
  transactionHash: string;
}) {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const res = await fetch(`${BASE_URL}/api/v1/frames/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ipfsHash,
      transactionHash,
    }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error("Error syncing content");
  }
}

export async function getContent(id: string, custodyAddress?: string) {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  let url = `${BASE_URL}/api/v1/frames/${id}`;
  if (custodyAddress) {
    url += `?address=${custodyAddress}`;
  }

  const res = await fetch(url);
  const data = await res.json();
  if (!data.success) {
    throw new Error("Error getting content");
  }
  return data;
}
