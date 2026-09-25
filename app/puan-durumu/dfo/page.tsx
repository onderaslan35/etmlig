<table className="w-full text-left text-xs md:text-sm">
              <thead className="text-[#64748b] uppercase text-[10px] bg-[#0f172a]">
                <tr>
                  <th className="pl-3 md:pl-4 pr-1 py-3 w-10 md:w-14 text-left">SIRA</th>
                  <th className="px-1 md:px-2 py-3 text-left">YARIŞMACI</th>
                  <th className="px-1 py-3 w-16 md:w-24 text-right"></th>
                  <th className="pr-3 md:pr-4 pl-1 py-3 w-12 md:w-16 text-center">PUAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {tableRows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-[#0f172a]/40 transition-colors">
                    <td className="pl-3 md:pl-4 pr-1 py-3 text-[#94a3b8] font-medium align-middle">
                      <div className="flex items-center">
                        <span className="text-left w-5">{row.currentRank}</span>
                        {row.trend === 'up' && <span className="text-emerald-400 text-[10px] font-bold flex items-center">▲<span className="text-[8px]">{row.trendDiff}</span></span>}
                        {row.trend === 'down' && <span className="text-red-500 text-[10px] font-bold flex items-center">▼<span className="text-[8px]">{row.trendDiff}</span></span>}
                      </div>
                    </td>
                    <td className="px-1 md:px-2 py-3 align-middle">
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-white font-semibold">
                        <span className="whitespace-nowrap">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-1 py-3 align-middle text-right">
                      {row.liveBonus > 0 && (
                        <span className="text-[9px] bg-emerald-950/80 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/50 animate-pulse whitespace-nowrap shadow-sm">
                          +{row.liveBonus} CANLI
                        </span>
                      )}
                    </td>
                    <td className="pr-3 md:pr-4 pl-1 py-3 align-middle font-bold text-sm text-blue-400 text-center">
                      {row.displayScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>