import React from 'react'
import { motion } from 'framer-motion'

const HowToPay = () => {
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      console.error('Unable to copy')
    }
  }

  return (
    <motion.div
      className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-100"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h4 className="text-lg font-semibold mb-2">How to pay (Bkash)</h4>

      <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
        <li>
          Send the exact <strong>amount</strong> to the receiver (merchant) number first.
        </li>

        <li>
          After the transfer, copy the <strong>transaction ID</strong> (e.g. TX12345678).
        </li>

        <li>
          Come back here and paste the <strong>transaction ID</strong> and the phone
          <strong> number</strong> you used.
        </li>

        <li>
          Click <strong>Submit Payment</strong> in the booking confirmation form to record your
          payment.
        </li>

        <li className="text-gray-600">
          Wait for admin confirmation — they will verify the transaction and mark the booking as
          paid.
        </li>
      </ol>

      <div className="mt-4 text-sm">
        <div className="flex items-center justify-between bg-white p-3 rounded-md border">
          <div>
            <div className="text-xs text-gray-500">Merchant Bkash Number</div>
            <div className="font-medium">01773448153</div>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => copyToClipboard('01773448153')}
            className="ml-4 px-3 py-1 rounded bg-pink-600 text-white text-sm font-medium"
          >
            Copy
          </motion.button>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Example Txn ID: <span className="font-mono">TX12345678</span>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Note: This component only shows instructions. Use the booking confirmation form to
          submit transaction id and number.
        </div>
      </div>
    </motion.div>
  )
}

export default HowToPay
