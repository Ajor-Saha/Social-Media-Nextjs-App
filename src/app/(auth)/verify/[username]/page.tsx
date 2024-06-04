'use client';

import { verifySchema } from '@/schemas/verifySchema';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VerifyAccount = () => {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async () => {
    try {
      const validationResult = verifySchema.safeParse({ code });

      if (!validationResult.success) {
        toast.error(validationResult.error.errors[0]?.message || 'Invalid input');
        return;
      }

      const response = await axios.post<ApiResponse>('/api/verify-code', {
        username: params.username,
        code,
      });

      toast.success(response.data.message);
      router.replace('/sign-in');
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        'Verification Failed: ' +
          (axiosError.response?.data.message ?? 'An error occurred. Please try again.')
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8  rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-6"
        >
          <div>
            <label htmlFor="code" className="block text-sm font-medium py-2">
              Verification Code
            </label>
            <input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              type="text"
              className="input input-bordered input-info w-full max-w-xs"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
          <div className="text-right">
            <button
              type="submit"
              className="btn btn-info"
            >
              Verify
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default VerifyAccount;
