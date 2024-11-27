"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";

import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
import Pagination from "@/components/Pagination";
import DeletePopup from "@/components/Popup/DeletePopup";

type User = {
  _id: string;
  username: string;
  // other user fields
};

interface Address {
  _id: string;
  governorate: string;
  city: string;
  zipcode: string;
  address: string;
}

interface invoice {
  _id: string;
  user: User;
  ref: string;
  address: Address;
  paymentMethod: string;
  deliveryMethod: string;
  createdAt: string;
  total: number;
}

const Listinvoice: React.FC = () => {
  const router = useRouter();
  const [invoice, setinvoice] = useState<invoice[]>([]); // All invoice
  const [filteredinvoice, setFilteredinvoice] = useState<invoice[]>([]); // Filtered invoice
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const invoicePerPage = 5;
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedinvoice, setSelectedinvoice] = useState({ id: "", name: "" });
  const [loadinginvoiceId, setLoadinginvoiceId] = useState<string | null>(null);
  // Timeframe state (par an, par mois, par jour)
  const [timeframe, setTimeframe] = useState<"year" | "month" | "day">("month");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const handleDeleteClick = (invoice: invoice) => {
    setLoadinginvoiceId(invoice._id);

    setSelectedinvoice({ id: invoice._id, name: invoice.ref });
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setLoadinginvoiceId(null);
  };

  const Deleteinvoice = async (id: string) => {
    try {
      const response = await fetch(`/api/invoice/deleteinvoicebyid/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      handleClosePopup();
      toast.success("invoice delete successfully!");

      await getinvoice();
    } catch (err: any) {
      toast.error(`[invoice_DELETE] ${err.message}`);
    } finally {
      setLoadinginvoiceId(null);
    }
  };
  const getinvoice = useCallback(async () => {
    try {
      const response = await fetch("/api/invoice/getallinvoice", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch invoice");
      }

      const data = await response.json();
      setinvoice(data); // Store all invoice
      setFilteredinvoice(data); // Initially, filteredinvoice are the same as invoice
    } catch (err: any) {
      setError(`[invoice_GET] ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getinvoice();
  }, [getinvoice]);
  useEffect(() => {
    // Set default selectedDate when the component is mounted
    const currentDate = new Date();
    if (timeframe === "year") {
      setSelectedDate(`${currentDate.getFullYear()}-01-01`);
    } else if (timeframe === "month") {
      setSelectedDate(`${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-01`);
    } else if (timeframe === "day") {
      setSelectedDate(currentDate.toISOString().split('T')[0]); // Current date in YYYY-MM-DD format
    }
  }, [timeframe]); 
  useEffect(() => {
    // Apply search filter
    const filtered = invoice.filter((invoice) => {
      const matchesSearch =
        invoice.ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.user?.username.toLowerCase().includes(searchTerm.toLowerCase());

      // Apply date filtering based on the selected timeframe
      const matchesDateFilter = (date: string) => {
        const invoiceDate = new Date(invoice.createdAt);
        const selectedDateObj = new Date(date);

        if (timeframe === "year") {
          return invoiceDate.getFullYear() === selectedDateObj.getFullYear();
        } else if (timeframe === "month") {
          return (
            invoiceDate.getFullYear() === selectedDateObj.getFullYear() &&
            invoiceDate.getMonth() === selectedDateObj.getMonth()
          );
        } else if (timeframe === "day") {
          return (
            invoiceDate.getFullYear() === selectedDateObj.getFullYear() &&
            invoiceDate.getMonth() === selectedDateObj.getMonth() &&
            invoiceDate.getDate() === selectedDateObj.getDate()
          );
        }
        return true; // No filter if no timeframe is selected
      };

      return matchesSearch && matchesDateFilter(selectedDate);
    });

    setFilteredinvoice(filtered);
    setCurrentPage(1); // Reset to the first page
  }, [searchTerm, invoice, timeframe, selectedDate]);

  const indexOfLastinvoice = currentPage * invoicePerPage;
  const indexOfFirstinvoice = indexOfLastinvoice - invoicePerPage;
  const currentinvoice = filteredinvoice.slice(
    indexOfFirstinvoice,
    indexOfLastinvoice
  );
  const totalPages = Math.ceil(filteredinvoice.length / invoicePerPage);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="mx-auto w-[85%] py-8 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <p className="text-3xl font-bold">ALL invoice</p>
      </div>
      <input
        type="text"
        placeholder="Search invoice"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mt-4 p-2 border border-gray-300 rounded"
      />
      <div className="flex justify-end ">
        <button
          onClick={() => setTimeframe("year")}
          className={`p-2 rounded-l ${
            timeframe === "year"
              ? "bg-gray-800 text-white"
              : "bg-gray-300 text-white"
          }`}
        >
          Par Année
        </button>
        <button
          onClick={() => setTimeframe("month")}
          className={`p-2 ${
            timeframe === "month"
              ? "bg-gray-800 text-white"
              : "bg-gray-300 text-white"
          }`}
        >
          Par Mois
        </button>
        <button
          onClick={() => setTimeframe("day")}
          className={`p-2 rounded-r ${
            timeframe === "day"
              ? "bg-gray-800 text-white"
              : "bg-gray-300 text-white"
          }`}
        >
          Par Jour
        </button>
        <input
    type={timeframe === "year" ? "number" : timeframe === "month" ? "month" : "date"}
    className="border rounded p-2 ml-4 w-44"
    value={timeframe === "year" ? selectedDate.split("-")[0] : timeframe === "month" ? selectedDate.slice(0, 7) : selectedDate}
    onChange={(e) => {
      if (timeframe === "year") {
        setSelectedDate(`${e.target.value}-01-01`);
      } else if (timeframe === "month") {
        setSelectedDate(e.target.value);
      } else {
        setSelectedDate(e.target.value);
      }
    }}
  />
      </div>
      <table className="table-auto w-full mt-4">
        <thead>
          <tr className="bg-gray-800">
            <th className="px-4 py-2">REF</th>
            <th className="px-4 py-2">Customer Name</th>
            <th className="px-4 py-2">Total</th>

            <th className="px-4 py-2">Payment Method</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 text-center py-2">Action</th>
          </tr>
        </thead>
        {loading ? (
          <tbody>
            <tr>
              <td colSpan={5}>
                <div className="flex justify-center items-center h-full w-full py-6">
                  <FaSpinner className="animate-spin text-[30px]" />
                </div>
              </td>
            </tr>
          </tbody>
        ) : filteredinvoice.length === 0 ? (
          <tbody>
            <tr>
              <td colSpan={5}>
                <div className="text-center py-6 text-gray-600 w-full">
                  <p>Aucune categorie trouvée.</p>
                </div>
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {currentinvoice.map((item) => (
              <tr
                key={item._id}
                className="bg-white text-black whitespace-nowrap"
              >
                <td className="border px-4 py-2">{item.ref}</td>
                <td className="border px-4 py-2 uppercase">
                  {item.user.username}
                </td>
                <td className="border px-4 py-2 text-start">
                  {item.total} TND
                </td>

                <td className="border px-4 py-2 uppercase">
                  {item.paymentMethod}
                </td>
                <td className="border px-4 py-2 ">
                  {new Date(item.createdAt).toLocaleDateString("en-GB")} -{" "}
                  {new Date(item.createdAt).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="border px-4 py-2">
                  <div className="flex items-center justify-center gap-2">
                    <Link href={`/admin/invoice/editinvoice/${item._id}`}>
                      <button
                        type="button"
                        className="bg-gray-800 text-white w-32 h-10 hover:bg-gray-600 rounded-md uppercase"
                      >
                        Edit
                      </button>
                    </Link>
                    <Link href={`/admin/invoice/${item._id}`}>
                      <button
                        type="button"
                        className="bg-gray-800 text-white w-32 h-10 hover:bg-gray-600 rounded-md uppercase"
                      >
                        FACture
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="bg-gray-800 text-white w-28 h-10 hover:bg-gray-600 rounded-md"
                      disabled={loadinginvoiceId === item._id}
                    >
                      {loadinginvoiceId === item._id
                        ? "Processing..."
                        : "DELETE"}
                    </button>
                    {isPopupOpen && (
                      <DeletePopup
                        handleClosePopup={handleClosePopup}
                        Delete={Deleteinvoice}
                        id={selectedinvoice.id} // Pass selected user's id
                        name={selectedinvoice.name}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
      <div className="flex justify-center mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalPages)}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Listinvoice;