// // src/components/ClientsTable/ClientsTable.jsx
// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { fetchClients, deleteClient, updateClient, addClient } from "../../api/API";
// import FilterComponent from "../ClientFilter/ClientFilter";
// import {
//   trainers,
//   sports,
//   months,
//   years,
//   days,
//   checkFieldOptions,
//   timeSlots,
//   saleOptions,
//   renewalOptions,
//   CORRECT_PIN,
//   paymentOptions,
//   errorMessages,
// } from "../../Constants/constants";
// import "./ClientsTable.scss";

// /* ===== helpers ===== */
// const splitComment = (comment = "") => {
//   const m = comment.match(/\(Добавил:\s*([^)]+)\)\s*$/);
//   const addedBy = m ? m[1].trim() : "";
//   const commentBody = m ? comment.replace(m[0], "").trim() : comment.trim();
//   return { commentBody, addedBy };
// };

// const normalizePayment = (v) => {
//   const s = String(v || "").toLowerCase().replace(/\s+/g, "");
//   if (["оплачено", "paid"].includes(s)) return "Оплачено";
//   if (["неоплачено", "неоплачен", "неоплата", "unpaid"].includes(s)) return "Неоплачено";
//   return v || "-";
// };
// const paymentClass = (v) => {
//   const n = normalizePayment(v);
//   if (n === "Оплачено") return "oplacheno";
//   if (n === "Неоплачено") return "neoplacheno";
//   return "unknown";
// };
// const safeNum = (v, def = 0) => {
//   const n = Number(String(v).replace(",", "."));
//   return Number.isFinite(n) ? n : def;
// };
// const trimLower = (s) => String(s || "").trim().toLowerCase();

// const Modal = ({ isOpen, onClose, title, children }) => {
//   if (!isOpen) return null;
//   return (
//     <div className="client-list__modal" role="dialog" aria-modal="true" aria-label={title}>
//       <div className="client-list__modal-content">
//         <button className="client-list__modal-close" onClick={onClose} aria-label="Закрыть">×</button>
//         <h2 className="client-list__modal-title">{title}</h2>
//         {children}
//       </div>
//     </div>
//   );
// };

// const SelectField = ({ name, value, onChange, options, placeholder, disabled }) => (
//   <select
//     name={name}
//     value={value || ""}
//     onChange={onChange}
//     className="client-list__modal-select"
//     disabled={disabled}
//     aria-label={placeholder}
//   >
//     <option value="" disabled>{placeholder}</option>
//     {options.map((option) => (
//       <option key={option} value={option}>{option}</option>
//     ))}
//   </select>
// );

// const InputField = ({ name, value, onChange, type = "text", placeholder, disabled }) => (
//   <input
//     type={type}
//     name={name}
//     value={value || ""}
//     onChange={onChange}
//     placeholder={placeholder}
//     className="client-list__modal-input"
//     disabled={disabled}
//     aria-label={placeholder}
//     autoComplete="off"
//   />
// );

// const DateFields = ({ formData, onChange, disabled, isEditing }) => (
//   <div className="client-list__modal-date-group">
//     {isEditing ? (
//       <>
//         <SelectField name="day" value={formData.day} onChange={onChange} options={days} placeholder="День" disabled={disabled} />
//         <SelectField name="month" value={formData.month} onChange={onChange} options={months} placeholder="Месяц" disabled={disabled} />
//         <SelectField name="year" value={formData.year} onChange={onChange} options={years} placeholder="Год" disabled />
//         <InputField name="dataCassa" value={formData.dataCassa} onChange={onChange} type="date" placeholder="Дата кассы" disabled={disabled} />
//       </>
//     ) : (
//       <>
//         <span>{formData.day || "-"} {formData.month || "-"} {formData.year || "-"}</span>
//         <span>{formData.dataCassa || "-"}</span>
//       </>
//     )}
//   </div>
// );

// /* ===== main ===== */
// const ClientsTable = () => {
//   const [clients, setClients] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [globalError, setGlobalError] = useState("");
//   const [filters, setFilters] = useState({
//     name: "", trainer: "", sport_category: "", day: "", month: "", year: "", typeClient: "", payment: "",
//   });

//   const [selectedClient, setSelectedClient] = useState(null);
//   const [modalState, setModalState] = useState({ type: null, data: null });
//   const [pinInput, setPinInput] = useState("");
//   const [pinError, setPinError] = useState("");
//   const [formData, setFormData] = useState({});
//   const [formErrors, setFormErrors] = useState([]);
//   const [selectedMonths, setSelectedMonths] = useState("1");
//   const [renewReport, setRenewReport] = useState("");
//   const [isProcessing, setIsProcessing] = useState(false);

//   const [page, setPage] = useState(1);
//   const PAGE_SIZE = 20;

//   const typeClients = ["Обычный", "Пробный", "Индивидуальный", "Абонемент"];
//   const allowedPayments = paymentOptions.map((o) => o.value);

//   const loadClients = useCallback(async () => {
//     try {
//       setLoading(true);
//       setGlobalError("");
//       const data = await fetchClients();
//       setClients(Array.isArray(data) ? data : []);
//     } catch {
//       setGlobalError(errorMessages.loadingError || "Ошибка загрузки.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { loadClients(); }, [loadClients]);

//   const filteredClients = useMemo(() => {
//     const res = clients.filter((client) =>
//       (!filters.name || trimLower(client.name).includes(trimLower(filters.name))) &&
//       (!filters.trainer || client.trainer === filters.trainer) &&
//       (!filters.sport_category || client.sport_category === filters.sport_category) &&
//       (!filters.day || client.day === filters.day) &&
//       (!filters.month || client.month === filters.month) &&
//       (!filters.year || client.year === filters.year) &&
//       (!filters.typeClient || client.typeClient === filters.typeClient) &&
//       (!filters.payment || filters.payment.split(",").includes(normalizePayment(client.payment)))
//     );
//     return res.reverse();
//   }, [clients, filters]);

//   useEffect(() => { setPage(1); }, [filters]);

//   const totalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));
//   const pageItems = filteredClients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

//   const getClientActivePeriods = useMemo(() => {
//     if (!selectedClient) return { count: 0, periods: [] };
//     const sameName = clients.filter((c) => trimLower(c.name) === trimLower(selectedClient.name));
//     const uniq = [
//       ...new Set(
//         sameName.filter((c) => c.month && c.year).map((c) => `${c.month} ${c.year}`)
//       ),
//     ];
//     return { count: uniq.length, periods: uniq };
//   }, [selectedClient, clients]);

//   const generateRenewalPeriods = (client, monthsToAdd) => {
//     const periods = [];
//     const currentMonthIndex = client.month ? months.indexOf(client.month) : 0;
//     const currentYearNum = client.year ? parseInt(client.year, 10) : 2025;
//     const currentDay = client.day || "01";
//     for (let i = 1; i <= monthsToAdd; i++) {
//       const totalMonths = currentMonthIndex + i;
//       const newMonthIndex = totalMonths % 12;
//       const yearsToAdd = Math.floor(totalMonths / 12);
//       periods.push({
//         month: months[newMonthIndex],
//         year: String(currentYearNum + yearsToAdd),
//         day: currentDay,
//       });
//     }
//     return periods;
//   };

//   const hasDuplicate = (data, excludeId = null) => {
//     const key = (c) =>
//       `${trimLower(c.name)}|${trimLower(c.sport_category)}|${c.month}|${c.year}`;
//     const targetKey = key(data);
//     return clients.some((c) => key(c) === targetKey && c.id !== excludeId);
//   };

//   const validateForm = (d, excludeId = null) => {
//     const errs = [];
//     if (!d.name || String(d.name).trim().length < 2) errs.push("Имя: минимум 2 символа.");
//     if (d.phone && !/^[\d()+\-\s]{7,20}$/.test(String(d.phone).trim())) errs.push("Телефон: неверный формат.");
//     if (d.price !== undefined) {
//       const n = safeNum(d.price, NaN);
//       if (!Number.isFinite(n) || n < 0) errs.push("Цена: укажите неотрицательное число.");
//     }
//     if (d.typeClient && !typeClients.includes(d.typeClient)) errs.push("Тип клиента: неверное значение.");
//     if (d.sale && !saleOptions.includes(d.sale)) errs.push("Скидка: неверное значение.");
//     if (d.payment && !allowedPayments.includes(normalizePayment(d.payment))) errs.push("Оплата: неверное значение.");
//     if (d.month && !months.includes(d.month)) errs.push("Месяц: неверное значение.");
//     if (d.year && !years.includes(d.year)) errs.push("Год: неверное значение.");
//     if (d.day && !days.includes(d.day)) errs.push("День: неверное значение.");
//     if (d.month && d.year && d.name && d.sport_category && hasDuplicate(d, excludeId)) {
//       errs.push("Дубликат: такой клиент за этот период уже есть.");
//     }
//     return errs;
//   };

//   const handleAction = (action, client) => {
//     switch (action) {
//       case "edit":
//         setModalState({ type: "pin", data: { action: "edit", id: client.id, client } });
//         setPinInput(""); setPinError(""); setFormErrors([]);
//         break;
//       case "delete":
//         setModalState({ type: "pin", data: { action: "delete", id: client.id } });
//         setPinInput(""); setPinError(""); setFormErrors([]);
//         break;
//       case "renewal":
//         setModalState({ type: "renewal", data: client });
//         setSelectedMonths("1"); setRenewReport("");
//         break;
//       default:
//         break;
//     }
//   };

//   const handlePinSubmit = () => {
//     if (pinInput !== CORRECT_PIN) { setPinError(errorMessages.invalidPin || "Неверный PIN."); return; }
//     const { action, id, client } = modalState.data;
//     setPinInput(""); setPinError("");
//     if (action === "delete") {
//       setModalState({ type: "delete", data: id });
//     } else if (action === "edit") {
//       const { commentBody, addedBy } = splitComment(client.comment || "");
//       setFormData({
//         ...client,
//         day: client.day || "",
//         month: client.month || "",
//         year: client.year || "2025",
//         typeClient: client.typeClient || "",
//         dataCassa: client.dataCassa || "",
//         commentBody,
//         addedBy,
//         payment: normalizePayment(client.payment),
//       });
//       setModalState({ type: "edit", data: { id, ...client } });
//     }
//   };

//   const handleEditChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleEditSave = async () => {
//     try {
//       setIsProcessing(true);
//       setFormErrors([]);

//       let updatedPrice = safeNum(formData.price, 0);
//       if (formData.sale === "15%") updatedPrice = +(updatedPrice * 0.85).toFixed(2);
//       if (formData.sale === "20%") updatedPrice = +(updatedPrice * 0.8).toFixed(2);

//       const mergedComment = `${(formData.commentBody || "").trim()}${formData.addedBy ? `\n(Добавил: ${formData.addedBy})` : ""}`;

//       const updated = {
//         ...formData,
//         price: updatedPrice,
//         comment: mergedComment,
//         payment: normalizePayment(formData.payment),
//       };
//       delete updated.commentBody; delete updated.addedBy;

//       const errs = validateForm(updated, modalState.data.id);
//       if (errs.length) { setFormErrors(errs); return; }

//       await updateClient(modalState.data.id, updated);
//       setClients((prev) => prev.map((c) => (c.id === modalState.data.id ? { ...c, ...updated } : c)));
//       setModalState({ type: null, data: null });
//     } catch {
//       setFormErrors([errorMessages.updateClientError || "Не удалось сохранить."]);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleRenewal = async () => {
//     try {
//       setIsProcessing(true);
//       setRenewReport("");
//       const client = modalState.data;
//       const count = parseInt(selectedMonths, 10) || 1;
//       const periods = generateRenewalPeriods(client, count);

//       const created = [];
//       const skipped = [];

//       for (const p of periods) {
//         const draft = { ...client, month: p.month, year: p.year, day: p.day };
//         if (hasDuplicate(draft, null)) { skipped.push(`${p.month} ${p.year}`); continue; }
//         await addClient(draft);
//         created.push(draft);
//       }
//       if (created.length) setClients((prev) => [...prev, ...created]);
//       if (skipped.length) setRenewReport(`Пропущено (дубликаты): ${skipped.join(", ")}`);
//       else setRenewReport("Продление успешно.");

//       if (created.length && !skipped.length) setModalState({ type: null, data: null });
//     } catch {
//       setRenewReport(errorMessages.renewalError || "Не удалось продлить.");
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleDeleteConfirm = async () => {
//     try {
//       setIsProcessing(true);
//       await deleteClient(modalState.data);
//       setClients((prev) => prev.filter((c) => c.id !== modalState.data));
//       setModalState({ type: null, data: null });
//     } catch {
//       setGlobalError(errorMessages.deleteClientError || "Не удалось удалить.");
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const closeModal = () => {
//     setModalState({ type: null, data: null });
//     setPinInput(""); setPinError(""); setSelectedClient(null);
//     setFormErrors([]); setRenewReport("");
//   };

//   const paginationNumbers = useMemo(() => {
//     const maxButtons = 7;
//     const nums = [];
//     let start = Math.max(1, page - 3);
//     let end = Math.min(totalPages, start + maxButtons - 1);
//     if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);
//     for (let i = start; i <= end; i++) nums.push(i);
//     return nums;
//   }, [page, totalPages]);

//   return (
//     <div className="client-list">
//       <FilterComponent filters={filters} setFilters={setFilters} />

//       {loading ? (
//         <div className="client-list__spinner" />
//       ) : globalError ? (
//         <p className="client-list__error">{globalError}</p>
//       ) : (
//         <>
//           <div className="client-list__table-container">
//             <table className="client-list__table">
//               <thead>
//                 <tr>
//                   <th>Имя</th>
//                   <th>Спорт</th>
//                   <th>Месяц</th>
//                   <th>Дата</th>
//                   <th>Оплата</th>
//                   <th />
//                 </tr>
//               </thead>
//               <tbody>
//                 {pageItems.length === 0 ? (
//                   <tr><td colSpan={6} style={{ textAlign: "center" }}>Нет данных</td></tr>
//                 ) : (
//                   pageItems.map((client) => {
//                     const pay = normalizePayment(client.payment);
//                     return (
//                       <tr
//                         key={client.id}
//                         className={pay === "Неоплачено" ? "client-list__row--unpaid" : ""}
//                       >
//                         <td>{client.name || "-"}</td>
//                         <td>{client.sport_category || "-"}</td>
//                         <td>{client.month || "-"}</td>
//                         <td>{client.dataCassa || "-"}</td>
//                         <td className={`client-list__payment client-list__payment--${paymentClass(pay)}`}>
//                           {pay}
//                         </td>
//                         <td className="client-list__actions">
//                           <button className="client-list__details" onClick={() => setSelectedClient(client)}>Подробности</button>
//                           <button className="client-list__action client-list__action--edit" onClick={() => handleAction("edit", client)}>Изменить</button>
//                           <button className="client-list__action client-list__action--renew" onClick={() => handleAction("renewal", client)}>Продлить</button>
//                           <button className="client-list__action client-list__action--delete" onClick={() => handleAction("delete", client)} disabled={isProcessing}>Удалить</button>
//                         </td>
//                       </tr>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Пагинация */}
//           {totalPages > 1 && (
//             <div className="client-list__pagination" role="navigation" aria-label="Пагинация">
//               <button
//                 className="client-list__page-btn"
//                 onClick={() => setPage(1)}
//                 disabled={page === 1}
//                 aria-label="Первая страница"
//               >«</button>
//               <button
//                 className="client-list__page-btn"
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 disabled={page === 1}
//                 aria-label="Предыдущая страница"
//               >‹</button>
//               {paginationNumbers.map((n) => (
//                 <button
//                   key={n}
//                   className={`client-list__page-btn ${n === page ? "is-active" : ""}`}
//                   onClick={() => setPage(n)}
//                   aria-current={n === page ? "page" : undefined}
//                 >
//                   {n}
//                 </button>
//               ))}
//               <button
//                 className="client-list__page-btn"
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 disabled={page === totalPages}
//                 aria-label="Следующая страница"
//               >›</button>
//               <button
//                 className="client-list__page-btn"
//                 onClick={() => setPage(totalPages)}
//                 disabled={page === totalPages}
//                 aria-label="Последняя страница"
//               >»</button>
//               <span className="client-list__page-info">
//                 {page} / {totalPages} • всего {filteredClients.length}
//               </span>
//             </div>
//           )}
//         </>
//       )}

//       {/* Детали */}
//       <Modal isOpen={!!selectedClient} onClose={closeModal} title="Детали клиента">
//         {selectedClient && (
//           <div className="client-list__modal-form">
//             <div className="client-list__modal-row"><span className="client-list__modal-label">Имя:</span><span>{selectedClient.name || "-"}</span></div>
//             <div className="client-list__modal-row"><span className="client-list__modal-label">Телефон:</span><span>{selectedClient.phone || "-"}</span></div>
//             <div className="client-list__modal-row"><span className="client-list__modal-label">Спорт:</span><span>{selectedClient.sport_category || "-"}</span></div>
//             <div className="client-list__modal-row"><span className="client-list__modal-label">Тренер:</span><span>{selectedClient.trainer || "-"}</span></div>
//             <div className="client-list__modal-row"><span className="client-list__modal-label">Время:</span><span>{selectedClient.email || "-"}</span></div>
//             <div className="client-list__modal-row"><span className="client-list__modal-label">Источник:</span><span>{selectedClient.check_field || "-"}</span></div>
//             <div className="client-list__modal-row"><span className="client-list__modal-label">Пол:</span><span>{selectedClient.stage || "-"}</span></div>
//             <div className="client-list__modal-row"><span className="client-list__modal-label">Дата:</span><DateFields formData={selectedClient} isEditing={false} /></div>
//             <div className="client-list__modal-row"><span className="client-list__modal-label">Тип клиента:</span><span>{selectedClient.typeClient || "-"}</span></div>
//             <div className="client-list__modal-row"><span className="client-list__modal-label">Цена:</span><span>{selectedClient.price ? `${selectedClient.price} сом` : "-"}</span></div>
//             <div className="client-list__modal-row"><span className="client-list__modal-label">Скидка:</span><span>{selectedClient.sale || "-"}</span></div>
//             <div className="client-list__modal-row">
//               <span className="client-list__modal-label">Оплата:</span>
//               <span className={`client-list__modal-payment client-list__modal-payment--${paymentClass(selectedClient.payment)}`}>
//                 {normalizePayment(selectedClient.payment)}
//               </span>
//             </div>
//             <div className="client-list__modal-row">
//               <span className="client-list__modal-label">Активные месяцы:</span>
//               <span>
//                 {getClientActivePeriods.count > 0 ? (
//                   <>
//                     {getClientActivePeriods.count} мес.{" "}
//                     <select className="client-list__modal-select" defaultValue="">
//                       <option value="" disabled>Период</option>
//                       {getClientActivePeriods.periods.map((period, index) => (
//                         <option key={index} value={period}>{period}</option>
//                       ))}
//                     </select>
//                   </>
//                 ) : "—"}
//               </span>
//             </div>
//             <div className="client-list__modal-row"><span className="client-list__modal-label">Комментарий:</span><span>{selectedClient.comment || "-"}</span></div>
//           </div>
//         )}
//       </Modal>

//       {/* Редактирование */}
//       <Modal isOpen={modalState.type === "edit"} onClose={closeModal} title="Редактирование">
//         <div className="client-list__modal-form">
//           {formErrors.length > 0 && (
//             <div className="client-list__error" role="alert" style={{ textAlign: "left" }}>
//               {formErrors.map((e, i) => <div key={i}>• {e}</div>)}
//             </div>
//           )}
//           <div className="client-list__modal-row"><span className="client-list__modal-label">Имя:</span><InputField name="name" value={formData.name} onChange={handleEditChange} placeholder="Имя" /></div>
//           <div className="client-list__modal-row"><span className="client-list__modal-label">Телефон:</span><InputField name="phone" value={formData.phone} onChange={handleEditChange} type="tel" placeholder="Телефон" /></div>
//           <div className="client-list__modal-row"><span className="client-list__modal-label">Спорт:</span><SelectField name="sport_category" value={formData.sport_category} onChange={handleEditChange} options={sports} placeholder="Спорт" /></div>
//           <div className="client-list__modal-row"><span className="client-list__modal-label">Тренер:</span><SelectField name="trainer" value={formData.trainer} onChange={handleEditChange} options={trainers} placeholder="Тренер" /></div>
//           <div className="client-list__modal-row"><span className="client-list__modal-label">Время:</span><SelectField name="email" value={formData.email} onChange={handleEditChange} options={timeSlots} placeholder="Время" /></div>
//           <div className="client-list__modal-row"><span className="client-list__modal-label">Источник:</span><SelectField name="check_field" value={formData.check_field} onChange={handleEditChange} options={checkFieldOptions} placeholder="Источник" /></div>
//           <div className="client-list__modal-row"><span className="client-list__modal-label">Пол:</span><SelectField name="stage" value={formData.stage} onChange={handleEditChange} options={["Мужской", "Женский"]} placeholder="Пол" /></div>
//           <div className="client-list__modal-row"><span className="client-list__modal-label">Дата:</span><DateFields formData={formData} onChange={handleEditChange} isEditing /></div>
//           <div className="client-list__modal-row"><span className="client-list__modal-label">Тип клиента:</span><SelectField name="typeClient" value={formData.typeClient} onChange={handleEditChange} options={typeClients} placeholder="Тип клиента" /></div>
//           <div className="client-list__modal-row"><span className="client-list__modal-label">Цена:</span><InputField name="price" value={formData.price} onChange={handleEditChange} type="number" placeholder="Цена" /></div>
//           <div className="client-list__modal-row"><span className="client-list__modal-label">Скидка:</span><SelectField name="sale" value={formData.sale} onChange={handleEditChange} options={saleOptions} placeholder="Скидка" /></div>
//           <div className="client-list__modal-row"><span className="client-list__modal-label">Оплата:</span><SelectField name="payment" value={formData.payment} onChange={handleEditChange} options={allowedPayments} placeholder="Оплата" /></div>
//           <div className="client-list__modal-row">
//             <span className="client-list__modal-label">Комментарий:</span>
//             <textarea name="commentBody" value={formData.commentBody || ""} onChange={handleEditChange} placeholder="Комментарий" className="client-list__modal-textarea" aria-label="Комментарий" />
//           </div>
//           <div className="client-list__modal-row">
//             <span className="client-list__modal-label">Добавил:</span>
//             <input className="client-list__modal-input" value={formData.addedBy || "—"} readOnly disabled />
//           </div>
//           <div className="client-list__modal-actions">
//             <button className="client-list__modal-button client-list__modal-button--save" onClick={handleEditSave} disabled={isProcessing}>Сохранить</button>
//             <button className="client-list__modal-button client-list__modal-button--cancel" onClick={closeModal}>Отмена</button>
//           </div>
//         </div>
//       </Modal>

//       {/* PIN */}
//       <Modal isOpen={modalState.type === "pin"} onClose={closeModal} title="PIN-код">
//         <div className="client-list__modal-form">
//           <InputField name="pin" type="password" value={pinInput} onChange={(e) => setPinInput(e.target.value)} placeholder="PIN-код" />
//           {pinError && <p className="client-list__error" role="alert">{pinError}</p>}
//           <div className="client-list__modal-actions">
//             <button className="client-list__modal-button client-list__modal-button--save" onClick={handlePinSubmit}>Подтвердить</button>
//             <button className="client-list__modal-button client-list__modal-button--cancel" onClick={closeModal}>Отмена</button>
//           </div>
//         </div>
//       </Modal>

//       {/* Удаление */}
//       <Modal isOpen={modalState.type === "delete"} onClose={closeModal} title="Удаление">
//         <p className="client-list__modal-message">Удалить клиента?</p>
//         <div className="client-list__modal-actions">
//           <button className="client-list__modal-button client-list__modal-button--save" onClick={handleDeleteConfirm} disabled={isProcessing}>Да</button>
//           <button className="client-list__modal-button client-list__modal-button--cancel" onClick={closeModal} disabled={isProcessing}>Отмена</button>
//         </div>
//       </Modal>

//       {/* Продление */}
//       <Modal isOpen={modalState.type === "renewal"} onClose={closeModal} title="Продление">
//         {modalState.data && (
//           <div className="client-list__modal-form">
//             {renewReport && <div className="client-list__error" role="status" style={{ textAlign: "left" }}>{renewReport}</div>}
//             <div className="client-list__modal-row"><span className="client-list__modal-label">Имя:</span><span>{modalState.data.name}</span></div>
//             <div className="client-list__modal-row"><span className="client-list__modal-label">Месяц:</span><span>{modalState.data.month || "-"}</span></div>
//             <div className="client-list__modal-row"><span className="client-list__modal-label">Тип клиента:</span><span>{modalState.data.typeClient || "-"}</span></div>
//             <div className="client-list__modal-row">
//               <span className="client-list__modal-label">Кол-во мес.:</span>
//               <SelectField name="months" value={selectedMonths} onChange={(e) => setSelectedMonths(e.target.value)} options={renewalOptions} placeholder="Месяцы" />
//             </div>
//             <div className="client-list__modal-actions">
//               <button className="client-list__modal-button client-list__modal-button--save" onClick={handleRenewal} disabled={isProcessing}>Подтвердить</button>
//               <button className="client-list__modal-button client-list__modal-button--cancel" onClick={closeModal}>Отмена</button>
//             </div>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default ClientsTable;



// src/components/ClientsTable/ClientsTable.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { fetchClients, deleteClient, updateClient, addClient } from "../../api/API";
import FilterComponent from "../ClientFilter/ClientFilter";
import {
  trainers,
  sports,
  months,
  years,
  days,
  checkFieldOptions,
  timeSlots,
  saleOptions,
  renewalOptions,
  CORRECT_PIN,
  paymentOptions,
  errorMessages,
} from "../../Constants/constants";
import "./ClientsTable.scss";

/* ===== helpers ===== */
const splitComment = (comment = "") => {
  const m = comment.match(/\(Добавил:\s*([^)]+)\)\s*$/);
  const addedBy = m ? m[1].trim() : "";
  const commentBody = m ? comment.replace(m[0], "").trim() : comment.trim();
  return { commentBody, addedBy };
};

const normalizePayment = (v) => {
  const s = String(v || "").toLowerCase().replace(/\s+/g, "");
  if (["оплачено", "paid"].includes(s)) return "Оплачено";
  if (["неоплачено", "неоплачен", "неоплата", "unpaid"].includes(s)) return "Не оплачено";
  return v || "-";
};
const paymentClass = (v) => {
  const n = normalizePayment(v);
  if (n === "Оплачено") return "oplacheno";
  if (n === "Неоплачено") return "neoplacheno";
  return "unknown";
};
const safeNum = (v, def = 0) => {
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : def;
};
const trimLower = (s) => String(s || "").trim().toLowerCase();

const buildISODate = (day, monthName, year) => {
  const mIndex = months.indexOf(monthName); // 0..11
  const mm = String(mIndex + 1).padStart(2, "0");
  const dd = String(day || "01").padStart(2, "0");
  return `${year}-${mm}-${dd}`;
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="client-list__modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="client-list__modal-content">
        <button className="client-list__modal-close" onClick={onClose} aria-label="Закрыть">×</button>
        <h2 className="client-list__modal-title">{title}</h2>
        {children}
      </div>
    </div>
  );
};

const SelectField = ({ name, value, onChange, options, placeholder, disabled }) => (
  <select
    name={name}
    value={value || ""}
    onChange={onChange}
    className="client-list__modal-select"
    disabled={disabled}
    aria-label={placeholder}
  >
    <option value="" disabled>{placeholder}</option>
    {options.map((option) => (
      <option key={option} value={option}>{option}</option>
    ))}
  </select>
);

const InputField = ({ name, value, onChange, type = "text", placeholder, disabled }) => (
  <input
    type={type}
    name={name}
    value={value || ""}
    onChange={onChange}
    placeholder={placeholder}
    className="client-list__modal-input"
    disabled={disabled}
    aria-label={placeholder}
    autoComplete="off"
  />
);

const DateFields = ({ formData, onChange, disabled, isEditing }) => (
  <div className="client-list__modal-date-group">
    {isEditing ? (
      <>
        <SelectField name="day" value={formData.day} onChange={onChange} options={days} placeholder="День" disabled={disabled} />
        <SelectField name="month" value={formData.month} onChange={onChange} options={months} placeholder="Месяц" disabled={disabled} />
        <SelectField name="year" value={formData.year} onChange={onChange} options={years} placeholder="Год" disabled />
        <InputField name="dataCassa" value={formData.dataCassa} onChange={onChange} type="date" placeholder="Дата кассы" disabled={disabled} />
      </>
    ) : (
      <>
        <span>{formData.day || "-"} {formData.month || "-"} {formData.year || "-"}</span>
        <span>{formData.dataCassa || "-"}</span>
      </>
    )}
  </div>
);

/* ===== main ===== */
const ClientsTable = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");
  const [filters, setFilters] = useState({
    name: "", trainer: "", sport_category: "", day: "", month: "", year: "", typeClient: "", payment: "",
  });

  const [selectedClient, setSelectedClient] = useState(null);
  const [modalState, setModalState] = useState({ type: null, data: null });
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState("1");
  const [renewReport, setRenewReport] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const typeClients = ["Обычный", "Пробный", "Индивидуальный", "Абонемент"];
  const allowedPayments = paymentOptions.map((o) => o.value);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      setGlobalError("");
      const data = await fetchClients();
      setClients(Array.isArray(data) ? data : []);
    } catch {
      setGlobalError(errorMessages.loadingError || "Ошибка загрузки.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadClients(); }, [loadClients]);

  const filteredClients = useMemo(() => {
    const res = clients.filter((client) =>
      (!filters.name || trimLower(client.name).includes(trimLower(filters.name))) &&
      (!filters.trainer || client.trainer === filters.trainer) &&
      (!filters.sport_category || client.sport_category === filters.sport_category) &&
      (!filters.day || client.day === filters.day) &&
      (!filters.month || client.month === filters.month) &&
      (!filters.year || client.year === filters.year) &&
      (!filters.typeClient || client.typeClient === filters.typeClient) &&
      (!filters.payment || filters.payment.split(",").includes(normalizePayment(client.payment)))
    );
    return res.reverse();
  }, [clients, filters]);

  useEffect(() => { setPage(1); }, [filters]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));
  const pageItems = filteredClients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getClientActivePeriods = useMemo(() => {
    if (!selectedClient) return { count: 0, periods: [] };
    const sameName = clients.filter((c) => trimLower(c.name) === trimLower(selectedClient.name));
    const uniq = [
      ...new Set(
        sameName.filter((c) => c.month && c.year).map((c) => `${c.month} ${c.year}`)
      ),
    ];
    return { count: uniq.length, periods: uniq };
  }, [selectedClient, clients]);

  const generateRenewalPeriods = (client, monthsToAdd) => {
    const periods = [];
    const currentMonthIndex = client.month ? months.indexOf(client.month) : 0;
    const currentYearNum = client.year ? parseInt(client.year, 10) : 2025;
    const currentDay = client.day || "01";
    for (let i = 1; i <= monthsToAdd; i++) {
      const totalMonths = currentMonthIndex + i;
      const newMonthIndex = totalMonths % 12;
      const yearsToAdd = Math.floor(totalMonths / 12);

      const monthName = months[newMonthIndex];
      const yearStr = String(currentYearNum + yearsToAdd);

      periods.push({
        month: monthName,
        year: yearStr,
        day: currentDay,
        dataCassa: buildISODate(currentDay, monthName, yearStr),
      });
    }
    return periods;
  };

  const hasDuplicate = (data, excludeId = null) => {
    const key = (c) =>
      `${trimLower(c.name)}|${trimLower(c.sport_category)}|${c.month}|${c.year}`;
    const targetKey = key(data);
    return clients.some((c) => key(c) === targetKey && c.id !== excludeId);
  };

  const validateForm = (d, excludeId = null) => {
    const errs = [];
    if (!d.name || String(d.name).trim().length < 2) errs.push("Имя: минимум 2 символа.");
    if (d.phone && !/^[\d()+\-\s]{7,20}$/.test(String(d.phone).trim())) errs.push("Телефон: неверный формат.");
    if (d.price !== undefined) {
      const n = safeNum(d.price, NaN);
      if (!Number.isFinite(n) || n < 0) errs.push("Цена: укажите неотрицательное число.");
    }
    if (d.typeClient && !typeClients.includes(d.typeClient)) errs.push("Тип клиента: неверное значение.");
    if (d.sale && !saleOptions.includes(d.sale)) errs.push("Скидка: неверное значение.");
    if (d.payment && !allowedPayments.includes(normalizePayment(d.payment))) errs.push("Оплата: неверное значение.");
    if (d.month && !months.includes(d.month)) errs.push("Месяц: неверное значение.");
    if (d.year && !years.includes(d.year)) errs.push("Год: неверное значение.");
    if (d.day && !days.includes(d.day)) errs.push("День: неверное значение.");
    if (d.month && d.year && d.name && d.sport_category && hasDuplicate(d, excludeId)) {
      errs.push("Дубликат: такой клиент за этот период уже есть.");
    }
    return errs;
  };

  const handleAction = (action, client) => {
    switch (action) {
      case "edit":
        setModalState({ type: "pin", data: { action: "edit", id: client.id, client } });
        setPinInput(""); setPinError(""); setFormErrors([]);
        break;
      case "delete":
        setModalState({ type: "pin", data: { action: "delete", id: client.id } });
        setPinInput(""); setPinError(""); setFormErrors([]);
        break;
      case "renewal":
        setModalState({ type: "renewal", data: client });
        setSelectedMonths("1"); setRenewReport("");
        break;
      default:
        break;
    }
  };

  const handlePinSubmit = () => {
    if (pinInput !== CORRECT_PIN) { setPinError(errorMessages.invalidPin || "Неверный PIN."); return; }
    const { action, id, client } = modalState.data;
    setPinInput(""); setPinError("");
    if (action === "delete") {
      setModalState({ type: "delete", data: id });
    } else if (action === "edit") {
      const { commentBody, addedBy } = splitComment(client.comment || "");
      setFormData({
        ...client,
        day: client.day || "",
        month: client.month || "",
        year: client.year || "2025",
        typeClient: client.typeClient || "",
        dataCassa: client.dataCassa || "",
        commentBody,
        addedBy,
        payment: normalizePayment(client.payment),
      });
      setModalState({ type: "edit", data: { id, ...client } });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    try {
      setIsProcessing(true);
      setFormErrors([]);

      let updatedPrice = safeNum(formData.price, 0);
      if (formData.sale === "15%") updatedPrice = +(updatedPrice * 0.85).toFixed(2);
      if (formData.sale === "20%") updatedPrice = +(updatedPrice * 0.8).toFixed(2);

      const mergedComment = `${(formData.commentBody || "").trim()}${formData.addedBy ? `\n(Добавил: ${formData.addedBy})` : ""}`;

      const updated = {
        ...formData,
        price: updatedPrice,
        comment: mergedComment,
        payment: normalizePayment(formData.payment),
      };
      delete updated.commentBody; delete updated.addedBy;

      const errs = validateForm(updated, modalState.data.id);
      if (errs.length) { setFormErrors(errs); return; }

      await updateClient(modalState.data.id, updated);
      setClients((prev) => prev.map((c) => (c.id === modalState.data.id ? { ...c, ...updated } : c)));
      setModalState({ type: null, data: null });
    } catch {
      setFormErrors([errorMessages.updateClientError || "Не удалось сохранить."]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRenewal = async () => {
    try {
      setIsProcessing(true);
      setRenewReport("");
      const client = modalState.data;
      const count = parseInt(selectedMonths, 10) || 1;
      const periods = generateRenewalPeriods(client, count);

      const created = [];
      const skipped = [];

      for (const p of periods) {
        const draft = {
          ...client,
          month: p.month,
          year: p.year,
          day: p.day,
          dataCassa: p.dataCassa,
        };
        if (hasDuplicate(draft, null)) { skipped.push(`${p.month} ${p.year}`); continue; }
        await addClient(draft);
        created.push(draft);
      }
      if (created.length) setClients((prev) => [...prev, ...created]);
      if (skipped.length) setRenewReport(`Пропущено (дубликаты): ${skipped.join(", ")}`);
      else setRenewReport("Продление успешно.");

      if (created.length && !skipped.length) setModalState({ type: null, data: null });
    } catch {
      setRenewReport(errorMessages.renewalError || "Не удалось продлить.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsProcessing(true);
      await deleteClient(modalState.data);
      setClients((prev) => prev.filter((c) => c.id !== modalState.data));
      setModalState({ type: null, data: null });
    } catch {
      setGlobalError(errorMessages.deleteClientError || "Не удалось удалить.");
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setModalState({ type: null, data: null });
    setPinInput(""); setPinError(""); setSelectedClient(null);
    setFormErrors([]); setRenewReport("");
  };

  const paginationNumbers = useMemo(() => {
    const maxButtons = 7;
    const nums = [];
    let start = Math.max(1, page - 3);
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }, [page, totalPages]);

  return (
    <div className="client-list">
      <FilterComponent filters={filters} setFilters={setFilters} />

      {loading ? (
        <div className="client-list__spinner" />
      ) : globalError ? (
        <p className="client-list__error">{globalError}</p>
      ) : (
        <>
          <div className="client-list__table-container">
            <table className="client-list__table">
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Спорт</th>
                  <th>Месяц</th>
                  <th>Дата</th>
                  <th>Оплата</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center" }}>Нет данных</td></tr>
                ) : (
                  pageItems.map((client) => {
                    const pay = normalizePayment(client.payment);
                    return (
                      <tr
                        key={client.id}
                        className={pay === "Неоплачено" ? "client-list__row--unpaid" : ""}
                      >
                        <td>{client.name || "-"}</td>
                        <td>{client.sport_category || "-"}</td>
                        <td>{client.month || "-"}</td>
                        <td>{client.dataCassa || "-"}</td>
                        <td className={`client-list__payment client-list__payment--${paymentClass(pay)}`}>
                          {pay}
                        </td>
                        <td className="client-list__actions">
                          <button className="client-list__details" onClick={() => setSelectedClient(client)}>Подробности</button>
                          <button className="client-list__action client-list__action--edit" onClick={() => handleAction("edit", client)}>Изменить</button>
                          <button className="client-list__action client-list__action--renew" onClick={() => handleAction("renewal", client)}>Продлить</button>
                          <button className="client-list__action client-list__action--delete" onClick={() => handleAction("delete", client)} disabled={isProcessing}>Удалить</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="client-list__pagination" role="navigation" aria-label="Пагинация">
              <button
                className="client-list__page-btn"
                onClick={() => setPage(1)}
                disabled={page === 1}
                aria-label="Первая страница"
              >«</button>
              <button
                className="client-list__page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Предыдущая страница"
              >‹</button>
              {paginationNumbers.map((n) => (
                <button
                  key={n}
                  className={`client-list__page-btn ${n === page ? "is-active" : ""}`}
                  onClick={() => setPage(n)}
                  aria-current={n === page ? "page" : undefined}
                >
                  {n}
                </button>
              ))}
              <button
                className="client-list__page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Следующая страница"
              >›</button>
              <button
                className="client-list__page-btn"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                aria-label="Последняя страница"
              >»</button>
              <span className="client-list__page-info">
                {page} / {totalPages} • всего {filteredClients.length}
              </span>
            </div>
          )}
        </>
      )}

      {/* Детали */}
      <Modal isOpen={!!selectedClient} onClose={closeModal} title="Детали клиента">
        {selectedClient && (
          <div className="client-list__modal-form">
            <div className="client-list__modal-row"><span className="client-list__modal-label">Имя:</span><span>{selectedClient.name || "-"}</span></div>
            <div className="client-list__modal-row"><span className="client-list__modal-label">Телефон:</span><span>{selectedClient.phone || "-"}</span></div>
            <div className="client-list__modal-row"><span className="client-list__modal-label">Спорт:</span><span>{selectedClient.sport_category || "-"}</span></div>
            <div className="client-list__modal-row"><span className="client-list__modal-label">Тренер:</span><span>{selectedClient.trainer || "-"}</span></div>
            <div className="client-list__modal-row"><span className="client-list__modal-label">Время:</span><span>{selectedClient.email || "-"}</span></div>
            <div className="client-list__modal-row"><span className="client-list__modal-label">Источник:</span><span>{selectedClient.check_field || "-"}</span></div>
            <div className="client-list__modal-row"><span className="client-list__modal-label">Пол:</span><span>{selectedClient.stage || "-"}</span></div>
            <div className="client-list__modal-row"><span className="client-list__modal-label">Дата:</span><DateFields formData={selectedClient} isEditing={false} /></div>
            <div className="client-list__modal-row"><span className="client-list__modal-label">Тип клиента:</span><span>{selectedClient.typeClient || "-"}</span></div>
            <div className="client-list__modal-row"><span className="client-list__modal-label">Цена:</span><span>{selectedClient.price ? `${selectedClient.price} сом` : "-"}</span></div>
            <div className="client-list__modal-row"><span className="client-list__modal-label">Скидка:</span><span>{selectedClient.sale || "-"}</span></div>
            <div className="client-list__modal-row">
              <span className="client-list__modal-label">Оплата:</span>
              <span className={`client-list__modal-payment client-list__modal-payment--${paymentClass(selectedClient.payment)}`}>
                {normalizePayment(selectedClient.payment)}
              </span>
            </div>
            <div className="client-list__modal-row">
              <span className="client-list__modal-label">Активные месяцы:</span>
              <span>
                {getClientActivePeriods.count > 0 ? (
                  <>
                    {getClientActivePeriods.count} мес.{" "}
                    <select className="client-list__modal-select" defaultValue="">
                      <option value="" disabled>Период</option>
                      {getClientActivePeriods.periods.map((period, index) => (
                        <option key={index} value={period}>{period}</option>
                      ))}
                    </select>
                  </>
                ) : "—"}
              </span>
            </div>
            <div className="client-list__modal-row"><span className="client-list__modal-label">Комментарий:</span><span>{selectedClient.comment || "-"}</span></div>
          </div>
        )}
      </Modal>

      {/* Редактирование */}
      <Modal isOpen={modalState.type === "edit"} onClose={closeModal} title="Редактирование">
        <div className="client-list__modal-form">
          {formErrors.length > 0 && (
            <div className="client-list__error" role="alert" style={{ textAlign: "left" }}>
              {formErrors.map((e, i) => <div key={i}>• {e}</div>)}
            </div>
          )}
          <div className="client-list__modal-row"><span className="client-list__modal-label">Имя:</span><InputField name="name" value={formData.name} onChange={handleEditChange} placeholder="Имя" /></div>
          <div className="client-list__modal-row"><span className="client-list__modal-label">Телефон:</span><InputField name="phone" value={formData.phone} onChange={handleEditChange} type="tel" placeholder="Телефон" /></div>
          <div className="client-list__modal-row"><span className="client-list__modal-label">Спорт:</span><SelectField name="sport_category" value={formData.sport_category} onChange={handleEditChange} options={sports} placeholder="Спорт" /></div>
          <div className="client-list__modal-row"><span className="client-list__modal-label">Тренер:</span><SelectField name="trainer" value={formData.trainer} onChange={handleEditChange} options={trainers} placeholder="Тренер" /></div>
          <div className="client-list__modal-row"><span className="client-list__modal-label">Время:</span><SelectField name="email" value={formData.email} onChange={handleEditChange} options={timeSlots} placeholder="Время" /></div>
          <div className="client-list__modal-row"><span className="client-list__modal-label">Источник:</span><SelectField name="check_field" value={formData.check_field} onChange={handleEditChange} options={checkFieldOptions} placeholder="Источник" /></div>
          <div className="client-list__modal-row"><span className="client-list__modal-label">Пол:</span><SelectField name="stage" value={formData.stage} onChange={handleEditChange} options={["Мужской", "Женский"]} placeholder="Пол" /></div>
          <div className="client-list__modal-row"><span className="client-list__modal-label">Дата:</span><DateFields formData={formData} onChange={handleEditChange} isEditing /></div>
          <div className="client-list__modal-row"><span className="client-list__modal-label">Тип клиента:</span><SelectField name="typeClient" value={formData.typeClient} onChange={handleEditChange} options={typeClients} placeholder="Тип клиента" /></div>
          <div className="client-list__modal-row"><span className="client-list__modal-label">Цена:</span><InputField name="price" value={formData.price} onChange={handleEditChange} type="number" placeholder="Цена" /></div>
          <div className="client-list__modal-row"><span className="client-list__modal-label">Скидка:</span><SelectField name="sale" value={formData.sale} onChange={handleEditChange} options={saleOptions} placeholder="Скидка" /></div>
          <div className="client-list__modal-row"><span className="client-list__modal-label">Оплата:</span><SelectField name="payment" value={formData.payment} onChange={handleEditChange} options={allowedPayments} placeholder="Оплата" /></div>
          <div className="client-list__modal-row">
            <span className="client-list__modal-label">Комментарий:</span>
            <textarea name="commentBody" value={formData.commentBody || ""} onChange={handleEditChange} placeholder="Комментарий" className="client-list__modal-textarea" aria-label="Комментарий" />
          </div>
          <div className="client-list__modal-row">
            <span className="client-list__modal-label">Добавил:</span>
            <input className="client-list__modal-input" value={formData.addedBy || "—"} readOnly disabled />
          </div>
          <div className="client-list__modal-actions">
            <button className="client-list__modal-button client-list__modal-button--save" onClick={handleEditSave} disabled={isProcessing}>Сохранить</button>
            <button className="client-list__modal-button client-list__modal-button--cancel" onClick={closeModal}>Отмена</button>
          </div>
        </div>
      </Modal>

      {/* PIN */}
      <Modal isOpen={modalState.type === "pin"} onClose={closeModal} title="PIN-код">
        <div className="client-list__modal-form">
          <InputField name="pin" type="password" value={pinInput} onChange={(e) => setPinInput(e.target.value)} placeholder="PIN-код" />
          {pinError && <p className="client-list__error" role="alert">{pinError}</p>}
          <div className="client-list__modal-actions">
            <button className="client-list__modal-button client-list__modal-button--save" onClick={handlePinSubmit}>Подтвердить</button>
            <button className="client-list__modal-button client-list__modal-button--cancel" onClick={closeModal}>Отмена</button>
          </div>
        </div>
      </Modal>

      {/* Удаление */}
      <Modal isOpen={modalState.type === "delete"} onClose={closeModal} title="Удаление">
        <p className="client-list__modal-message">Удалить клиента?</p>
        <div className="client-list__modal-actions">
          <button className="client-list__modal-button client-list__modal-button--save" onClick={handleDeleteConfirm} disabled={isProcessing}>Да</button>
          <button className="client-list__modal-button client-list__modal-button--cancel" onClick={closeModal} disabled={isProcessing}>Отмена</button>
        </div>
      </Modal>

      {/* Продление */}
      <Modal isOpen={modalState.type === "renewal"} onClose={closeModal} title="Продление">
        {modalState.data && (
          <div className="client-list__modal-form">
            {renewReport && <div className="client-list__error" role="status" style={{ textAlign: "left" }}>{renewReport}</div>}
            <div className="client-list__modal-row"><span className="client-list__modal-label">Имя:</span><span>{modalState.data.name}</span></div>
            <div className="client-list__modal-row"><span className="client-list__modal-label">Месяц:</span><span>{modalState.data.month || "-"}</span></div>
            <div className="client-list__modal-row"><span className="client-list__modal-label">Тип клиента:</span><span>{modalState.data.typeClient || "-"}</span></div>
            <div className="client-list__modal-row">
              <span className="client-list__modal-label">Кол-во мес.:</span>
              <SelectField name="months" value={selectedMonths} onChange={(e) => setSelectedMonths(e.target.value)} options={renewalOptions} placeholder="Месяцы" />
            </div>
            <div className="client-list__modal-actions">
              <button className="client-list__modal-button client-list__modal-button--save" onClick={handleRenewal} disabled={isProcessing}>Подтвердить</button>
              <button className="client-list__modal-button client-list__modal-button--cancel" onClick={closeModal}>Отмена</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClientsTable;
