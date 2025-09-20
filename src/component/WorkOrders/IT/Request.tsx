// const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError(null);

//     const dataToSend: WorkOrderFormData = {
//       ...formData,
//       service_type_id: Number(formData.service_type_id),
//       service_id: Number(formData.service_id),
//     };

//     try {
//       if (workOrderId) {
//         await updateWorkOrderIT(workOrderId, dataToSend);
//         setSuccessMessage({
//           message: "Work Order updated successfully!",
//           work_order: { work_order_no: workOrderId },
//         });
//         setShowSuccessModal(true);
//       }
//     } catch (err: any) {
//       setError(err.message || "Failed to update work order. Please try again.");
//       console.error("Submission error:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };